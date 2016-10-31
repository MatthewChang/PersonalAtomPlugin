'use babel';

import WordcountTestView from './wordcount-test-view';
import { CompositeDisposable } from 'atom';

const ESCAPE = 27
const RIGHT = 186 //;
const SPACE = 32 //;
const LEFT = 74 //j
const UP = 76 //l
const DOWN = 75 //k
const TIMEOUT_DEFAULT = 120

function gen(editorAction,spaceAction) {
  return {timeout: TIMEOUT_DEFAULT,editorAction,spaceAction,firing: false}
}
const actionMap = {
  [RIGHT]: gen((e) => e.moveRight(1),(e) => e.selectRight(1)),
  [LEFT]: gen((e) => e.moveLeft(1),(e) => e.selectLeft(1)),
  [UP]: gen((e) => e.moveUp(1),(e) => e.selectUp(1)),
  [DOWN]: gen((e) => e.moveDown(1),(e) => e.selectDown(1))
}

export default {

  wordcountTestView: null,
  modalPanel: null,
  subscriptions: null,
  keysDown: {},
  firing: {},

  activate(state) {
    this.wordcountTestView = new WordcountTestView(state.wordcountTestViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.wordcountTestView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'wordcount-test:toggle': () => this.toggle()
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'wordcount-test:move_right': (e) => this.move(e,RIGHT)
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'wordcount-test:move_left': (e) => this.move(e,LEFT)
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'wordcount-test:move_up': (e) => this.move(e,UP)
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'wordcount-test:move_down': (e) => this.move(e,DOWN)
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'wordcount-test:space': (e) => {
        if (!this.keysDown[ESCAPE]){
          e.abortKeyBinding()
        }
      }
    }));

    let commands = [
  [ "line_beginning",
    (editor) => editor.moveToFirstCharacterOfLine(),
    (editor) => editor.selectToFirstCharacterOfLine()
  ],
  [
    "line_ending",
    (editor) => editor.moveToEndOfLine(),
    (editor) => editor.selectToEndOfLine()
  ] ,[
    "backspace",
    (editor) => editor.backspace(), () => {}
  ] ,[
    "delete",
    (editor) => editor.delete(), () => {}
  ]
  ]

    commands.forEach(([name,fn,fns]) => {
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        [`wordcount-test:${name}`]: (e) => {
          if (this.keysDown[ESCAPE]){
            let editor = atom.workspace.getActiveTextEditor()
            if(editor) {
              if(this.keysDown[SPACE]) {
                fns(editor)
              } else {
                fn(editor)
              }
            }
          } else {
            e.abortKeyBinding()
          }
        }
      }));
    })

    atom.workspace.observeTextEditors((editor) => {
      let editorView = atom.views.getView(editor)
      editorView.addEventListener('keydown', (event) => {
        this.keysDown[event.which] = true
        console.log(event.which)
      })
      editorView.addEventListener('keyup', (event) => {
        this.keysDown[event.which] = false
        if(actionMap[event.which]) {
          actionMap[event.which].firing = false
          actionMap[event.which].timeout = TIMEOUT_DEFAULT
        }
      })
    })
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.wordcountTestView.destroy();
  },

  serialize() {
    return {
      wordcountTestViewState: this.wordcountTestView.serialize()
    };
  },

  move(e,action) {
    if(this.keysDown[ESCAPE]) {
      if(!actionMap[action].firing) {
        actionMap[action].firing = true

        let editor = atom.workspace.getActiveTextEditor()
        if(editor) {
          if(this.keysDown[SPACE]) {
            actionMap[action].spaceAction(editor)
          } else {
            actionMap[action].editorAction(editor)
          }
        }
        this.setTimeoutsFor(action)
      }
    } else {
      e.abortKeyBinding()
    }
  },

  setTimeoutsFor(action) {
    setTimeout(() => {
      if(actionMap[action].firing) {
        let editor = atom.workspace.getActiveTextEditor()
        if(editor) {
          if(this.keysDown[SPACE]) {
            actionMap[action].spaceAction(editor)
          } else {
            actionMap[action].editorAction(editor)
          }

        }
        this.setTimeoutsFor(action)

        var r = actionMap[action].timeout*0.7
        actionMap[action].timeout = Math.max(r,15)
      }
    },actionMap[action].timeout)
  }

}
