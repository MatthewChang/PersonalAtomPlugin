'use babel';

import WordcountTestView from './wordcount-test-view';
import { CompositeDisposable } from 'atom';

const ESCAPE = 27
const RIGHT = 186 //;

export default {

  wordcountTestView: null,
  modalPanel: null,
  subscriptions: null,
  keysDown: {},
  firing: {},
  rightTimeout: 120,

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
      'wordcount-test:move_right': (e) => this.move_right(e)
    }));
    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'wordcount-test:move_left': (e) => this.move_left(e)
    // }));
    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'wordcount-test:move_up': (e) => this.move_up(e)
    // }));
    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'wordcount-test:move_down': (e) => this.move_down(e)
    // }));

    atom.workspace.observeTextEditors((editor) => {
      let editorView = atom.views.getView(editor)
      editorView.addEventListener('keydown', (event) => {
        this.keysDown[event.which] = true
      })
      editorView.addEventListener('keyup', (event) => {
        this.keysDown[event.which] = false
        this.firing[event.which] = false
        this.rightTimeout = 120
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

  toggle() {
    console.log('WordcountTest was toggled!');
    if(this.modalPanel.isVisible()) {
        this.modalPanel.hide()
    } else {
        let editor = atom.workspace.getActiveTextEditor()
        words = editor.getText().split(/\s+/).length
        this.wordcountTestView.setCount(words)
        this.modalPanel.show()
    }
  },

  move_right(e) {
    if(this.keysDown[ESCAPE]) {
      if(!this.firing[RIGHT]) {
        this.firing[RIGHT] = true

        let editor = atom.workspace.getActiveTextEditor()
        if(editor) {
          editor.moveRight(1)
        }
        this.setRightTimeout()
      }
    } else {
      e.abortKeyBinding()
    }
  },

  setRightTimeout() {
    setTimeout(() => {
      if(this.firing[RIGHT]) {
        let editor = atom.workspace.getActiveTextEditor()
        if(editor) {
          editor.moveRight(1)
        }
        this.setRightTimeout()

        var r = this.rightTimeout*0.4
        this.rightTimeout = Math.max(r,30)
      }
    },this.rightTimeout)
  }

}
