const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// 예: schemas 폴더에 JSON 스키마를 파일별로 두고 등록
const schemas = {
  // 'AuthRegister': require('../schemas/auth.register.schema.json')
};
for (const [k, s] of Object.entries(schemas)) ajv.addSchema(s, k);

function validate(rules = {}) {
  return (req, res, next) => {
    try {
      for (const [part, schemaName] of Object.entries(rules)) {
        if (!schemaName) continue;
        const v = ajv.getSchema(schemaName);
        if (!v) throw new Error(`Schema not found: ${schemaName}`);
        const ok = v(req[part]);
        if (!ok) return res.status(400).json({ error: 'VALIDATION_ERROR', details: v.errors });
      }
      next();
    } catch (e) { next(e); }
  };
}
module.exports = { validate, ajv };
