
import { useState } from 'react';
import {
  RECIPE_CATEGORIES,
  RECIPE_LEVELS,
  RECIPE_TITLE_MAX,
  RECIPE_INTRO_MAX,
  COOKING_TIME_DEFAULT,
  IMAGE_TYPES,
  IMAGE_MAX_MB,
} from '../constants';

import {
  mockIngredients,
  mockStandardTools,
} from '../mockData';

import "./recipeForm.css";


function RecipeForm({ initialData = null, onSave }) {

  const [form, setForm] = useState(() => ({
    recipe_title: initialData?.recipe_title ?? '',
    intro: initialData?.intro ?? '',
    r_category_id: initialData?.r_category_id ?? '',
    level: initialData?.level ?? RECIPE_LEVELS[0],
    cooking_time:
      initialData?.cooking_time ?? COOKING_TIME_DEFAULT,

    // 새로 추가한 항목
    servings: initialData?.servings ?? 1,
    main_image_url: initialData?.main_image_url ?? '',
    main_image_file: null,

    tool_ids: initialData?.tool_ids?.map(Number) ?? [],

    ingredients: initialData?.ingredients?.length
      ? initialData.ingredients.map((item) => ({ ...item }))
      : [],

    steps: initialData?.steps?.length
      ? initialData.steps.map((step) => ({ ...step }))
      : [{ step_content: '' }],
  }));

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // 재료 검색 관련 상태
  const [ingredientKeyword, setIngredientKeyword] = useState('');
  const [ingredientAmount, setIngredientAmount] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // 도구 더보기
  const [showAllTools, setShowAllTools] = useState(false);

  const keyword = ingredientKeyword.trim().toLowerCase();

  // 검색어에 맞는 재료 목록
  const ingredientResults = keyword
    ? mockIngredients.filter((ingredient) =>
        ingredient.ing_name.toLowerCase().includes(keyword)
      )
    : [];

  // 일반 필드 변경
  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError('');
  };

  // 재료 추가
  const addIngredient = (ingredient, amount = ingredientAmount) => {
    if (!ingredient) return;

    if (!amount.trim()) {
      setError('재료의 분량을 입력해 주세요.');
      return;
    }

    setForm((prev) => {
      const exists = prev.ingredients.some(
        (item) =>
          Number(item.ing_id) === Number(ingredient.ing_id)
      );

      if (exists) return prev;

      return {
        ...prev,
        ingredients: [
          ...prev.ingredients,
          {
            ing_id: ingredient.ing_id,
            ing_name: ingredient.ing_name,
            amount_text: amount.trim(),
          },
        ],
      };
    });

    setIngredientKeyword('');
    setIngredientAmount('');
    setSelectedIngredient(null);
    setError('');
  };

  // 선택한 재료의 분량 수정
  const updateIngredient = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      ),
    }));

    setError('');
  };

  // 조리 단계 내용 수정
  const updateStep = (index, value) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index
          ? { ...step, step_content: value }
          : step
      ),
    }));

    setError('');
  };

  // 조리 단계 순서 변경
  const moveStep = (index, direction) => {
    setForm((prev) => {
      const nextIndex = index + direction;

      if (
        nextIndex < 0 ||
        nextIndex >= prev.steps.length
      ) {
        return prev;
      }

      const steps = [...prev.steps];

      [steps[index], steps[nextIndex]] = [
        steps[nextIndex],
        steps[index],
      ];

      return {
        ...prev,
        steps,
      };
    });
  };

  // 이미지 검증 및 미리보기
  const readImage = (file, callback) => {
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setError('JPG, PNG, WEBP 사진만 선택할 수 있습니다.');
      return;
    }

    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      setError(`사진은 ${IMAGE_MAX_MB}MB 이하로 선택하세요.`);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      callback(reader.result, file);
      setError('');
    };

    reader.onerror = () => {
      setError('사진을 읽지 못했습니다.');
    };

    reader.readAsDataURL(file);
  };

  // 단계별 이미지 변경
  const updateStepImage = (index, file) => {
    readImage(file, (url, imageFile) => {
      setForm((prev) => ({
        ...prev,
        steps: prev.steps.map((step, i) =>
          i === index
            ? {
                ...step,
                step_image_file: imageFile,
                step_image_url: url,
              }
            : step
        ),
      }));
    });
  };

  // 대표 사진 변경
  const updateMainImage = (file) => {
    readImage(file, (url, imageFile) => {
      setForm((prev) => ({
        ...prev,
        main_image_file: imageFile,
        main_image_url: url,
      }));
    });
  };

  // 폼 제출
  const submit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const invalid =
      !form.recipe_title.trim() ||
      !form.r_category_id ||
      !form.main_image_url ||
      form.tool_ids.length === 0 ||
      form.ingredients.length === 0 ||
      !Number.isInteger(Number(form.cooking_time)) ||
      Number(form.cooking_time) < 1 ||
      !Number.isInteger(Number(form.servings)) ||
      Number(form.servings) < 1 ||
      form.ingredients.some(
        (item) =>
          !item.ing_id ||
          !item.amount_text.trim()
      ) ||
      form.steps.some(
        (step) => !step.step_content.trim()
      );

    if (invalid) {
      setError(
        '대표 사진·제목·종류·재료(분량)·도구·만드는 법 등 필수 항목을 확인해 주세요.'
      );
      return;
    }

    const payload = {
      ...form,

      recipe_title: form.recipe_title.trim(),
      intro: form.intro.trim(),
      r_category_id: Number(form.r_category_id),

      tool_ids: form.tool_ids.map(Number),
      cooking_time: Number(form.cooking_time),
      servings: Number(form.servings),

      ingredients: form.ingredients.map((item) => ({
        ...item,
        ing_id: Number(item.ing_id),
        amount_text: item.amount_text.trim(),
      })),

      steps: form.steps.map((step, index) => ({
        ...step,
        step_no: index + 1,
        step_content: step.step_content.trim(),
      })),
    };

    setSaving(true);
    setError('');

    try {
      await onSave(payload);
    } catch (err) {
      setError(err?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 표시할 도구 목록
  const visibleTools = showAllTools
    ? mockStandardTools
    : mockStandardTools.slice(0, 5);

  return (
    <form className="recipe-form" onSubmit={submit}>

      {/* ===== 제목 ===== */}
      <div className="recipe-form__heading">
        <h2>
          {initialData ? '레시피 수정' : '레시피 쓰기'}
        </h2>
        <span>* 필수, 빈 칸으로 저장 불가</span>
      </div>

      {/* ===== 1. 대표 사진 / 제목 / 소개 ===== */}
      <div className="recipe-form__intro-row">

        <label className="recipe-form__cover">
          {form.main_image_url ? (
            <img
              src={form.main_image_url}
              alt="대표 사진 미리보기"
            />
          ) : (
            <span>+ 대표 사진 *</span>
          )}

          <input
            type="file"
            accept={IMAGE_TYPES.join(',')}
            onChange={(e) => {
              updateMainImage(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>

        <div className="recipe-form__intro-fields">

          <label htmlFor="recipe-title">
            제목 *
          </label>

          <input
            id="recipe-title"
            placeholder="요리 이름 입력"
            value={form.recipe_title}
            maxLength={RECIPE_TITLE_MAX}
            onChange={(e) =>
              update('recipe_title', e.target.value)
            }
            required
          />

          <label
            htmlFor="recipe-intro"
            className="recipe-form__optional"
          >
            + 한 줄 소개 (선택)
          </label>

          <input
            id="recipe-intro"
            placeholder="이 요리를 소개해 주세요"
            value={form.intro}
            maxLength={RECIPE_INTRO_MAX}
            onChange={(e) =>
              update('intro', e.target.value)
            }
          />

        </div>
      </div>

      {/* ===== 2. 조리 시간 / 인분 / 난이도 ===== */}
      <div className="recipe-form__two-cols">

        <div className="recipe-form__field">
          <label htmlFor="recipe-time">
            조리 시간 *
          </label>

          <div className="recipe-form__number">
            <input
              id="recipe-time"
              type="number"
              min="1"
              step="1"
              value={form.cooking_time}
              onChange={(e) =>
                update('cooking_time', e.target.value)
              }
              required
            />
            <span>분</span>
          </div>
        </div>

        <div className="recipe-form__field">
          <label htmlFor="recipe-servings">
            인분
          </label>

          <div className="recipe-form__counter">

            <button
              type="button"
              onClick={() =>
                update(
                  'servings',
                  Math.max(1, Number(form.servings) - 1)
                )
              }
            >
              −
            </button>

            <input
              id="recipe-servings"
              type="number"
              min="1"
              step="1"
              value={form.servings}
              onChange={(e) =>
                update('servings', e.target.value)
              }
            />

            <button
              type="button"
              onClick={() =>
                update(
                  'servings',
                  Number(form.servings || 0) + 1
                )
              }
            >
              +
            </button>

          </div>
        </div>

        <div className="recipe-form__field">
          <span className="recipe-form__label">
            난이도
          </span>

          <div className="recipe-form__pills">
            {RECIPE_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                className={`recipe-form__pill ${
                  form.level === level ? 'is-active' : ''
                }`}
                onClick={() => update('level', level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ===== 3. 요리 종류 ===== */}
      <div className="recipe-form__field recipe-form__horizontal">

        <span className="recipe-form__label">
          요리 종류 *
        </span>

        <div className="recipe-form__pills">

          {RECIPE_CATEGORIES.map((category) => (
            <button
              key={category.r_category_id}
              type="button"
              className={`recipe-form__pill ${
                String(form.r_category_id) ===
                String(category.r_category_id)
                  ? 'is-active'
                  : ''
              }`}
              onClick={() =>
                update(
                  'r_category_id',
                  category.r_category_id
                )
              }
            >
              {category.category_name}
            </button>
          ))}

        </div>
      </div>

      {/* ===== 4. 재료 ===== */}
      <section className="recipe-form__section">

        <h3>재료 *</h3>

        <div className="recipe-form__ingredient-entry">

          <div className="recipe-form__search-wrap">

            <input
              id="ingredient-search"
              type="search"
              placeholder="재료 검색"
              value={ingredientKeyword}
              onChange={(e) => {
                setIngredientKeyword(e.target.value);
                setSelectedIngredient(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />

            {/* 검색 결과 */}
            {keyword && (
              <div className="recipe-form__search-results">

                {ingredientResults.length ? (
                  ingredientResults.map((ingredient) => {

                    const selected = form.ingredients.some(
                      (item) =>
                        Number(item.ing_id) ===
                        Number(ingredient.ing_id)
                    );

                    return (
                      <button
                        key={ingredient.ing_id}
                        type="button"
                        disabled={selected}
                        onClick={() => {
                          setSelectedIngredient(ingredient);
                          setIngredientKeyword(
                            ingredient.ing_name
                          );
                        }}
                      >
                        {ingredient.ing_name}
                        {selected ? ' (추가됨)' : ''}
                      </button>
                    );
                  })
                ) : (
                  <p>검색된 재료가 없습니다.</p>
                )}

              </div>
            )}

          </div>

          <input
            aria-label="재료 분량"
            placeholder="분량 (예: 1모, 약간)"
            value={ingredientAmount}
            onChange={(e) =>
              setIngredientAmount(e.target.value)
            }
          />

          <button
            type="button"
            className="recipe-form__add"
            onClick={() =>
              addIngredient(selectedIngredient)
            }
          >
            추가
          </button>

        </div>

        {/* 추가된 재료 태그 */}
        <div className="recipe-form__chips">

          {form.ingredients.map((item, index) => (
            <div
              className="recipe-form__chip"
              key={item.ing_id}
            >

              <span>
                {item.ing_name ??
                  mockIngredients.find(
                    (ingredient) =>
                      Number(ingredient.ing_id) ===
                      Number(item.ing_id)
                  )?.ing_name ??
                  '재료'}
              </span>

              <input
                aria-label="선택한 재료 분량 수정"
                value={item.amount_text}
                onChange={(e) =>
                  updateIngredient(
                    index,
                    'amount_text',
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                aria-label="재료 삭제"
                onClick={() =>
                  update(
                    'ingredients',
                    form.ingredients.filter(
                      (_, i) => i !== index
                    )
                  )
                }
              >
                ×
              </button>

            </div>
          ))}

        </div>

      </section>

      {/* ===== 5. 조리 도구 ===== */}
      <section className="recipe-form__section recipe-form__tools">

        <h3>필요한 도구 *</h3>

        <div className="recipe-form__pills">

          {visibleTools.map((tool) => (
            <button
              key={tool.tool_id}
              type="button"
              className={`recipe-form__pill ${
                form.tool_ids
                  .map(Number)
                  .includes(Number(tool.tool_id))
                    ? 'is-active'
                    : ''
              }`}
              onClick={() => {
                const selected = form.tool_ids
                  .map(Number)
                  .includes(Number(tool.tool_id));

                const updated = selected
                  ? form.tool_ids.filter(
                      (id) =>
                        Number(id) !== Number(tool.tool_id)
                    )
                  : [
                      ...form.tool_ids,
                      Number(tool.tool_id),
                    ];

                update('tool_ids', updated);
              }}
            >
              {tool.tool_name}
            </button>
          ))}

          {mockStandardTools.length > 5 && (
            <button
              type="button"
              className="recipe-form__pill"
              onClick={() =>
                setShowAllTools((prev) => !prev)
              }
            >
              {showAllTools ? '접기' : '+ 더보기'}
            </button>
          )}

        </div>
      </section>

      {/* ===== 6. 만드는 법 ===== */}
      <section className="recipe-form__section">

        <div className="recipe-form__section-heading">

          <h3>만드는 법 *</h3>

          <button
            type="button"
            className="recipe-form__add"
            onClick={() =>
              update('steps', [
                ...form.steps,
                { step_content: '' },
              ])
            }
          >
            + 단계 추가
          </button>

        </div>

        {form.steps.map((step, index) => (

          <div
            className="recipe-form__step"
            key={index}
          >

            <span className="recipe-form__step-num">
              {index + 1}
            </span>

            <textarea
              aria-label={`${index + 1}단계 조리 설명`}
              placeholder="조리 과정을 입력해 주세요"
              value={step.step_content}
              onChange={(e) =>
                updateStep(index, e.target.value)
              }
              required
            />

            {/* 단계별 사진 */}
            <label className="recipe-form__step-photo">

              {step.step_image_url ? (
                <img
                  src={step.step_image_url}
                  alt={`${index + 1}단계 사진`}
                />
              ) : (
                <span>+ 사진</span>
              )}

              <input
                type="file"
                accept={IMAGE_TYPES.join(',')}
                onChange={(e) => {
                  updateStepImage(
                    index,
                    e.target.files?.[0]
                  );
                  e.target.value = '';
                }}
              />

            </label>

            {/* 순서 변경 및 삭제 */}
            <div className="recipe-form__step-actions">

              <button
                type="button"
                aria-label="위로 이동"
                disabled={index === 0}
                onClick={() =>
                  moveStep(index, -1)
                }
              >
                ↑
              </button>

              <button
                type="button"
                aria-label="아래로 이동"
                disabled={
                  index === form.steps.length - 1
                }
                onClick={() =>
                  moveStep(index, 1)
                }
              >
                ↓
              </button>

              <button
                type="button"
                aria-label="단계 삭제"
                disabled={form.steps.length === 1}
                onClick={() =>
                  update(
                    'steps',
                    form.steps.filter(
                      (_, i) => i !== index
                    )
                  )
                }
              >
                ×
              </button>

            </div>

          </div>
        ))}

      </section>

      {/* ===== 오류 메시지 ===== */}
      {error && (
        <p
          className="recipe-form__error"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* ===== 하단 버튼 ===== */}
      <div className="recipe-form__footer">

        <span>
          필수: 사진 · 제목 · 종류 · 재료(분량) · 도구 · 만드는 법
        </span>

        <div>

          <button
            type="button"
            className="recipe-form__cancel"
            onClick={() => window.history.back()}
          >
            취소
          </button>

          <button
            type="submit"
            className="recipe-form__submit"
            disabled={saving}
          >
            {saving
              ? '저장 중...'
              : initialData
                ? '레시피 수정'
                : '레시피 등록'}
          </button>

        </div>
      </div>

    </form>
  );
}

export default RecipeForm;
