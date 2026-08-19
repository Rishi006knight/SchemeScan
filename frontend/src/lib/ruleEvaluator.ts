import type { ProfileData, Scheme, EligibilityResult, EligibilityCheckResponse } from './api'
import fallbackSchemes from '@/data/schemesData.json'

export function evaluateClientEligibility(profile: Partial<ProfileData>): EligibilityCheckResponse {
  const schemes = fallbackSchemes as unknown as Scheme[]
  const eligible: EligibilityResult[] = []
  const not_eligible: EligibilityResult[] = []
  const needs_info: EligibilityResult[] = []

  const profileComplete = Boolean(
    profile.age &&
    profile.gender &&
    profile.state &&
    profile.annual_income !== undefined &&
    profile.occupation
  )

  for (const scheme of schemes) {
    const explanations: Array<{ field: string; label: string; met: boolean | null; message: string }> = []
    let isEligible = true
    let needsMoreInfo = false

    // State check
    if (scheme.state_applicable !== 'All') {
      if (!profile.state) {
        needsMoreInfo = true
        explanations.push({
          field: 'state',
          label: 'State of Residence',
          met: null,
          message: `Requires residence in ${scheme.state_applicable} (state not set).`,
        })
      } else if (profile.state.toLowerCase() === scheme.state_applicable.toLowerCase()) {
        explanations.push({
          field: 'state',
          label: 'State of Residence',
          met: true,
          message: `Resident of ${scheme.state_applicable}.`,
        })
      } else {
        isEligible = false
        explanations.push({
          field: 'state',
          label: 'State of Residence',
          met: false,
          message: `Available only for residents of ${scheme.state_applicable}.`,
        })
      }
    }

    // Rule checks
    const rule = scheme.rule?.logic as Record<string, unknown> | undefined
    if (rule) {
      evaluateRuleNodes(rule, profile, explanations, (fail) => {
        if (fail.reason === 'missing') needsMoreInfo = true
        else isEligible = false
      })
    }

    // If no specific rules failed and no info missing
    if (explanations.length === 0) {
      explanations.push({
        field: 'general',
        label: 'General Eligibility',
        met: true,
        message: 'You meet the general baseline criteria for this welfare scheme.',
      })
    }

    const item: EligibilityResult = {
      scheme_id: scheme.id,
      scheme_name: scheme.name,
      category: scheme.category,
      result: isEligible && !needsMoreInfo ? 'eligible' : needsMoreInfo ? 'needs_info' : 'not_eligible',
      explanation: explanations,
      benefits: scheme.benefits,
      official_website: scheme.official_website,
      deadline: scheme.deadline,
    }

    if (item.result === 'eligible') eligible.push(item)
    else if (item.result === 'needs_info') needs_info.push(item)
    else not_eligible.push(item)
  }

  return {
    profile_complete: profileComplete,
    summary: {
      eligible_count: eligible.length,
      not_eligible_count: not_eligible.length,
      needs_info_count: needs_info.length,
    },
    eligible,
    not_eligible,
    needs_info,
  }
}

function evaluateRuleNodes(
  node: Record<string, unknown>,
  profile: Partial<ProfileData>,
  explanations: Array<{ field: string; label: string; met: boolean | null; message: string }>,
  onFail: (f: { reason: 'missing' | 'failed' }) => void
) {
  for (const [op, val] of Object.entries(node)) {
    if (op === 'and' && Array.isArray(val)) {
      for (const child of val) {
        evaluateRuleNodes(child as Record<string, unknown>, profile, explanations, onFail)
      }
    } else if (op === 'or' && Array.isArray(val)) {
      // Evaluate OR group
      let orPassed = false
      for (const child of val) {
        const subExp: typeof explanations = []
        let subFailed = false
        evaluateRuleNodes(child as Record<string, unknown>, profile, subExp, () => { subFailed = true })
        if (!subFailed) {
          orPassed = true
          explanations.push(...subExp)
          break
        }
      }
      if (!orPassed) {
        onFail({ reason: 'failed' })
        explanations.push({
          field: 'category',
          label: 'Eligibility Group',
          met: false,
          message: 'Did not match any of the required special category conditions.',
        })
      }
    } else if (['==', '!=', '<', '<=', '>', '>=', 'in'].includes(op) && Array.isArray(val)) {
      const [left, right] = val
      let varName: string | undefined
      if (typeof left === 'object' && left !== null && 'var' in left) {
        varName = (left as { var: string }).var
      }

      if (varName) {
        const userVal = (profile as Record<string, unknown>)[varName]
        const check = evaluateSingleCondition(op, userVal, right)

        if (userVal === undefined || userVal === null) {
          onFail({ reason: 'missing' })
          explanations.push({
            field: varName,
            label: formatFieldLabel(varName),
            met: null,
            message: `Requires ${formatFieldLabel(varName)} (not provided in your profile).`,
          })
        } else if (check) {
          explanations.push({
            field: varName,
            label: formatFieldLabel(varName),
            met: true,
            message: `Criterion met for ${formatFieldLabel(varName)}.`,
          })
        } else {
          onFail({ reason: 'failed' })
          explanations.push({
            field: varName,
            label: formatFieldLabel(varName),
            met: false,
            message: `Does not meet condition: ${formatFieldLabel(varName)} must be ${op} ${right} (your value: ${userVal}).`,
          })
        }
      }
    }
  }
}

function evaluateSingleCondition(op: string, userVal: unknown, ruleVal: unknown): boolean {
  if (userVal === undefined || userVal === null) return false
  const numUser = Number(userVal)
  const numRule = Number(ruleVal)

  switch (op) {
    case '==':
      return String(userVal).toLowerCase() === String(ruleVal).toLowerCase()
    case '!=':
      return String(userVal).toLowerCase() !== String(ruleVal).toLowerCase()
    case '<':
      return !isNaN(numUser) && !isNaN(numRule) && numUser < numRule
    case '<=':
      return !isNaN(numUser) && !isNaN(numRule) && numUser <= numRule
    case '>':
      return !isNaN(numUser) && !isNaN(numRule) && numUser > numRule
    case '>=':
      return !isNaN(numUser) && !isNaN(numRule) && numUser >= numRule
    case 'in':
      if (Array.isArray(ruleVal)) {
        return ruleVal.map(String).map(s => s.toLowerCase()).includes(String(userVal).toLowerCase())
      }
      return false
    default:
      return false
  }
}

function formatFieldLabel(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}
