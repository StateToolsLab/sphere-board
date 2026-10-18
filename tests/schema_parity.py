from pathlib import Path
import json
from jsonschema import Draft202012Validator
R=Path(__file__).resolve().parents[1]
schema=json.loads((R/'spec/starter-map.schema.json').read_text())
validator=Draft202012Validator(schema)
files=[R/'map.json',R/'examples/essay.json',R/'examples/exhibition.json',R/'examples/sample-map.json',R/'templates/project/.sphere/map.json',R/'ja/map.json',*sorted((R/'examples/ja').glob('*.json'))]
for path in files:
    data=json.loads(path.read_text())
    errors=list(validator.iter_errors(data))
    if errors: raise AssertionError(f'{path}: {errors[0].message}')
print(f'Schema parity: {len(files)} Starter maps valid')
