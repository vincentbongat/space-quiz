const fs = require('fs');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert/strict');

function createStubElement(tagName = 'div') {
  return {
    tagName,
    children: [],
    style: {},
    dataset: {},
    attributes: {},
    hidden: false,
    textContent: '',
    innerHTML: '',
    className: '',
    disabled: false,
    parentElement: { setAttribute() {} },
    focus() {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    addEventListener() {},
    append(...nodes) {
      this.children.push(...nodes);
      this.firstElementChild = this.children[0] || null;
    },
    replaceChildren(...nodes) {
      this.children = [...nodes];
      this.firstElementChild = this.children[0] || null;
    },
    appendChild(node) {
      this.children.push(node);
      this.firstElementChild = this.children[0] || null;
      return node;
    },
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => true,
      contains: () => false
    }
  };
}

function loadQuizLogic() {
  const html = fs.readFileSync('index.html', 'utf8');
  const match = html.match(/<script>([\s\S]*)<\/script>/);
  assert.ok(match, 'Expected quiz script in index.html');

  const ids = [
    'welcome', 'quiz', 'results', 'question-count', 'score', 'progress', 'answers',
    'feedback', 'next', 'start', 'restart', 'question', 'result-title', 'result-copy',
    'final-score', 'result-progress', 'result-emoji'
  ];

  const elements = Object.fromEntries(ids.map((id) => [id, createStubElement()]));
  const doc = {
    getElementById(id) {
      if (!elements[id]) {
        elements[id] = createStubElement();
      }
      return elements[id];
    },
    querySelector(selector) {
      if (selector === '.result-track') {
        return { setAttribute: () => {} };
      }
      return elements.progress;
    },
    createElement(tagName) {
      return createStubElement(tagName);
    }
  };

  const context = vm.createContext({ document: doc, console, Math, setTimeout, clearTimeout });
  vm.runInContext(match[1], context);

  return {
    context,
    elements,
    questions: vm.runInContext('questions', context),
    shuffleQuestions: vm.runInContext('shuffleQuestions', context),
    startMission: vm.runInContext('startMission', context)
  };
}

function readState(context) {
  return {
    runQuestions: vm.runInContext('runQuestions', context),
    score: vm.runInContext('score', context)
  };
}

test('shuffleQuestions keeps all questions once per run', () => {
  const { questions, shuffleQuestions } = loadQuizLogic();
  const original = questions.map((item) => item.q);
  const shuffled = shuffleQuestions(questions).map((item) => item.q);

  assert.equal(shuffled.length, original.length);
  assert.equal(new Set(shuffled).size, original.length);
  assert.deepEqual(new Set(shuffled), new Set(original));
});

test('startMission resets score and creates a fresh shuffled order', () => {
  const { questions, startMission, context } = loadQuizLogic();
  const first = [];
  const second = [];

  context.Math = Object.create(Math);
  context.Math.random = () => 0.1;
  startMission();
  first.push(...readState(context).runQuestions.map((item) => item.q));
  assert.equal(readState(context).score, 0);

  context.Math = Object.create(Math);
  context.Math.random = () => 0.9;
  startMission();
  second.push(...readState(context).runQuestions.map((item) => item.q));

  assert.equal(readState(context).score, 0);
  assert.equal(readState(context).runQuestions.length, questions.length);
  assert.equal(new Set(readState(context).runQuestions.map((item) => item.q)).size, questions.length);
  assert.notDeepEqual(first, second);
});
