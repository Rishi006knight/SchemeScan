"""
Eligibility Rule Engine
Evaluates JSON Logic rules against a citizen profile dict.
Walks the rule tree to generate human-readable explanations.
"""
try:
    from json_logic import jsonLogic
except ImportError:
    def jsonLogic(tests, data=None):
        if data is None:
            data = {}
        if not isinstance(tests, dict):
            return tests
        for op, val in tests.items():
            if op == "var":
                var_name = val[0] if isinstance(val, list) else val
                return data.get(var_name)
            if isinstance(val, list):
                values = [jsonLogic(v, data) for v in val]
            else:
                values = [jsonLogic(val, data)]
            if op == "and":
                return all(bool(v) for v in values)
            elif op == "or":
                return any(bool(v) for v in values)
            elif op == "==":
                return values[0] == values[1]
            elif op == "!=":
                return values[0] != values[1]
            elif op == "<":
                return values[0] < values[1] if (values[0] is not None and values[1] is not None) else False
            elif op == "<=":
                return values[0] <= values[1] if (values[0] is not None and values[1] is not None) else False
            elif op == ">":
                return values[0] > values[1] if (values[0] is not None and values[1] is not None) else False
            elif op == ">=":
                return values[0] >= values[1] if (values[0] is not None and values[1] is not None) else False
            elif op == "in":
                item, container = values[0], values[1]
                if item is None or container is None:
                    return False
                return item in container
            elif op == "!":
                return not bool(values[0])
            return False

# Map profile field names to human-readable labels
FIELD_LABELS = {
    'age': 'Age',
    'gender': 'Gender',
    'state': 'State',
    'district': 'District',
    'annual_income': 'Annual Income (₹)',
    'occupation': 'Occupation',
    'education': 'Education',
    'category': 'Category (SC/ST/OBC)',
    'disability_status': 'Disability Status',
    'marital_status': 'Marital Status',
    'family_size': 'Family Size',
    'is_rural': 'Rural Resident',
    'land_ownership_acres': 'Land Ownership (acres)',
    'is_student': 'Student',
    'employment_status': 'Employment Status',
}

OPERATOR_LABELS = {
    '<':   'is less than',
    '<=':  'is at most',
    '>':   'is greater than',
    '>=':  'is at least',
    '==':  'is',
    '!=':  'is not',
    'in':  'is one of',
}


def _format_value(val):
    if isinstance(val, bool):
        return 'Yes' if val else 'No'
    if isinstance(val, (int, float)) and val >= 1000:
        return f'₹{val:,.0f}'
    if isinstance(val, list):
        return ', '.join(str(v) for v in val)
    return str(val)


def _explain_node(node, profile_data):
    """
    Recursively walk a JSON Logic node and return a list of
    human-readable condition dicts: {label, met, message}
    """
    if not isinstance(node, dict):
        return []

    results = []
    for operator, operands in node.items():
        if operator in ('and', 'or', 'all', 'some'):
            sub_results = []
            for child in operands:
                sub_results.extend(_explain_node(child, profile_data))
            results.extend(sub_results)

        elif operator in OPERATOR_LABELS and isinstance(operands, list) and len(operands) == 2:
            left, right = operands
            # Extract field var
            if isinstance(left, dict) and 'var' in left:
                field = left['var']
                label = FIELD_LABELS.get(field, field.replace('_', ' ').title())
                user_val = profile_data.get(field)
                required_val = right

                op_label = OPERATOR_LABELS[operator]
                met = jsonLogic(node, profile_data)

                if user_val is None:
                    message = f"{label} — not provided (required: {op_label} {_format_value(required_val)})"
                    results.append({'field': field, 'label': label, 'met': None, 'message': message})
                else:
                    if met:
                        message = f"{label} ({_format_value(user_val)}) {op_label} {_format_value(required_val)} ✔"
                    else:
                        message = f"{label} ({_format_value(user_val)}) does not meet requirement: {op_label} {_format_value(required_val)} ✖"
                    results.append({'field': field, 'label': label, 'met': bool(met), 'message': message})

            elif isinstance(right, dict) and 'var' in right:
                # Handle reversed operands (e.g., {"in": [{"var": "category"}, ["SC","ST"]]})
                field = right['var']
                label = FIELD_LABELS.get(field, field.replace('_', ' ').title())
                user_val = profile_data.get(field)
                required_val = left
                met = jsonLogic(node, profile_data)
                if user_val is None:
                    message = f"{label} — not provided"
                    results.append({'field': field, 'label': label, 'met': None, 'message': message})
                else:
                    if met:
                        message = f"{label} ({_format_value(user_val)}) qualifies ✔"
                    else:
                        message = f"{label} ({_format_value(user_val)}) does not qualify ✖"
                    results.append({'field': field, 'label': label, 'met': bool(met), 'message': message})

        elif operator == 'in':
            # {"in": [{"var": "category"}, ["SC","ST","OBC"]]}
            if isinstance(operands, list) and len(operands) == 2:
                var_part, values = operands
                if isinstance(var_part, dict) and 'var' in var_part:
                    field = var_part['var']
                    label = FIELD_LABELS.get(field, field.replace('_', ' ').title())
                    user_val = profile_data.get(field)
                    met = jsonLogic(node, profile_data)
                    if user_val is None:
                        results.append({'field': field, 'label': label, 'met': None,
                                        'message': f"{label} — not provided (must be one of: {_format_value(values)})"})
                    elif met:
                        results.append({'field': field, 'label': label, 'met': True,
                                        'message': f"{label} ({_format_value(user_val)}) is accepted ✔"})
                    else:
                        results.append({'field': field, 'label': label, 'met': False,
                                        'message': f"{label} ({_format_value(user_val)}) must be one of: {_format_value(values)} ✖"})

        elif operator == '!':
            sub = _explain_node(operands if isinstance(operands, dict) else operands[0], profile_data)
            # Negate 'met' for negation operator
            for item in sub:
                item['met'] = not item['met'] if item['met'] is not None else None
            results.extend(sub)

    return results


def evaluate_eligibility(rule_logic, profile_data):
    """
    Returns:
        result: 'eligible' | 'not_eligible' | 'needs_info'
        explanation: list of condition dicts
    """
    explanation = _explain_node(rule_logic, profile_data)

    # If any field is None → needs_info
    missing = [e for e in explanation if e['met'] is None]
    if missing:
        return 'needs_info', explanation

    try:
        passed = bool(jsonLogic(rule_logic, profile_data))
    except Exception:
        passed = False

    result = 'eligible' if passed else 'not_eligible'
    return result, explanation
