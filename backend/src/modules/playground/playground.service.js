const svc = require('./playground.service');
const pool = require('../../shared/db');

function httpError(status, msg) {
  const e = new Error(msg);
  e.status = status;
  return e;
}

// 아주 단순한 “가짜 분석기”
function runAnalyzer(promptText, rules) {
  const len = promptText ? promptText.length : 0;

  const issues = [];
  const suggestions = [];

  if (len < 30) {
    issues.push({
      type: 'short',
      message: '프롬프트가 너무 짧습니다. 의도와 출력 형식을 더 구체적으로 적어 보세요.',
      range: { start: 0, end: len }
    });
    suggestions.push({
      title: '요구사항 상세화',
      example: '예: 원하는 출력 형식(목록/표/JSON)과 대상 사용자(초보자/전문가)를 명시해 보세요.'
    });
  }

  const score = Math.max(50, Math.min(95, 60 + Math.floor(len / 20)));

  return {
    enabled: true,
    score,
    issues,
    suggestions
  };
}


// 아주 단순한 가짜 분석기
function runAnalyzer(text, rules) {
  const len = text.length;
  let score = Math.max(50, Math.min(95, 60 + Math.floor(len / 20)));

  const issues = [];
  const suggestions = [];

  if (len < 30) {
    issues.push({
      type: 'short',
      message: '프롬프트가 너무 짧습니다.',
      range: { start: 0, end: len }
    });
    suggestions.push({
      title: '요구사항 상세화',
      example: '출력 형식과 의도를 명확히 적어보세요.'
    });
  }

  return { enabled: true, score, issues, suggestions };
}



exports.runPlayground = async function (userId, body, cb) {
  try {
    if (!body || !body.prompt_text || !body.model_id) {
      return cb(httpError(400, 'prompt_text, model_id 필수'));
    }

    const promptText  = body.prompt_text;
    const modelParams = body.model_params || {};
    const analyzerOpt = body.analyzer || {};

    const renderedPrompt = promptText;
    const fakeOutput =
      `[MOCK_OUTPUT]\n\n${renderedPrompt}\n\n(여기에 실제 모델 응답이 들어갈 예정입니다.)`;

    const usage = {
      input_tokens: renderedPrompt.length,
      output_tokens: fakeOutput.length,
    };

    let analyzerResult = null;
    if (analyzerOpt.enabled) {
      analyzerResult = runAnalyzer(promptText, analyzerOpt.rules);
    }

    // ✅ playground_history INSERT
    let historyId = null;
    try {
      const promptVersionId =
        body.source && body.source.prompt_version_id
          ? body.source.prompt_version_id
          : null;

      const modelSettingJson = JSON.stringify({
        temperature: modelParams.temperature ?? 1.0,
        max_token:   modelParams.max_token ?? null,
        top_p:       modelParams.top_p ?? null,
      });

      const [result] = await pool.query(
        `INSERT INTO playground_history
         (prompt_version_id, model_id, user_id,
          test_content, model_setting, output, tested_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          promptVersionId,
          body.model_id,
          userId,
          renderedPrompt,
          modelSettingJson,
          fakeOutput,
        ]
      );

      historyId = result.insertId;  // 👈 이게 5, 6, 7 ... 이런 숫자로 나올 예정
    } catch (err) {
      console.error('❌ playground_history INSERT 실패:', err);
      // 기록 실패해도 실행 응답은 정상 돌려줌
    }

    cb(null, {
      status: 'success',
      output: fakeOutput,
      usage,
      model: {
        id: body.model_id,
        temperature: modelParams.temperature ?? 1.0,
        max_token:   modelParams.max_token ?? null,
        top_p:       modelParams.top_p ?? null,
      },
      analyzer: analyzerResult || { enabled: false },
      history_id: historyId,
    });
  } catch (err) {
    cb(err);
  }
};


// 2) 품질 점검만
exports.grammarCheck = function(userId, body, cb) {
  if (!body || !body.prompt_text) {
    return cb(httpError(400, 'prompt_text 필수'));
  }
  const rules = body.rules || ['clarity','structure','variables','safety'];

  const res = runAnalyzer(body.prompt_text, rules);

  // 아주 단순한 가중치로 checks 구성
  const checks = {
    clarity: 0.8,
    structure: 0.7,
    variables: 0.6,
    safety: 0.9
  };

  cb(null, {
    score: res.score,
    issues: res.issues,
    suggestions: res.suggestions,
    checks
  });
};

// 3) 히스토리 목록
exports.listHistory = function(userId, query, cb) {
  // TODO: playground_history 테이블에서 user_id 기준으로 조회
  // 지금은 빈 리스트만 반환
  cb(null, {
    items: [],
    page: Number(query.page || 1),
    limit: Number(query.limit || 20),
    total: 0
  });
};

// 4) 히스토리 상세
exports.getHistory = function(userId, historyId, cb) {
  // TODO: playground_history where id = ? and user_id = ?
  // 지금은 더미 404
  cb(httpError(404, 'HISTORY_NOT_FOUND'));
};

// 5) 히스토리 삭제
exports.deleteHistory = function(userId, historyId, cb) {
  // TODO: DELETE playground_history where id = ? and user_id = ?
  cb(null);
};

// 6) 저장(프롬프트/버전화)
exports.saveFromPlayground = function(userId, body, cb) {
  if (!body || !body.mode) {
    return cb(httpError(400, 'mode 필수'));
  }

  // 지금은 실제 DB 저장 안 하고, 프롬프트/버전 id도 가짜 값으로 응답
  if (body.mode === 'new_prompt') {
    return cb(null, {
      prompt_id: 999001,
      prompt_version_id: 999101,
      latest_version_updated: true
    });
  }

  if (body.mode === 'new_version') {
    if (!body.target_prompt_id) {
      return cb(httpError(400, 'target_prompt_id 필수'));
    }
    return cb(null, {
      prompt_id: body.target_prompt_id,
      prompt_version_id: 999201,
      latest_version_updated: body.version && body.version.is_draft === false
    });
  }

  return cb(httpError(400, 'UNKNOWN_MODE'));
};

// 7) 플레이그라운드 설정 조회
exports.getSettings = function(userId, cb) {
  // TODO: user별 설정 테이블에서 조회
  cb(null, {
    analyzer_default_enabled: true,
    default_model_id: 3,
    default_params: { temperature: 0.7, max_token: 1024, top_p: 1.0 }
  });
};

// 8) 플레이그라운드 설정 수정
exports.updateSettings = function(userId, patch, cb) {
  // TODO: upsert into playground_settings
  cb(null, { updated: true });
};
