import React from 'react';
import { EditorState, Modifier } from 'draft-js';
import { slugify } from './utils';

// Creates the entities as soon as it is rendered.
class AnchorSource extends React.Component {
  componentDidMount() {
    const { editorState, entityType, onComplete } = this.props;

    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    // Gets the selected text from the editor
    var selectionState = editorState.getSelection();
    var anchorKey = selectionState.getAnchorKey();
    var currentContentBlock = content.getBlockForKey(anchorKey);
    var start = selectionState.getStartOffset();
    var end = selectionState.getEndOffset();
    var selectedText = currentContentBlock.getText().slice(start, end);

    // Uses the Draft.js API to create a new entity with the right data.
    const contentWithEntity = content.createEntity(entityType.type, 'IMMUTABLE', {
        anchor: slugify(selectedText),
    });
    const entityKey = contentWithEntity.getLastCreatedEntityKey();

    // Add some text for the entity to be activated on.
    const text = `${selectedText}`;

    const newContent = Modifier.replaceText(content, selection, text, null, entityKey);
    const nextState = EditorState.push(editorState, newContent, 'insert-characters');

    onComplete(nextState);
  }

  render() {
    return null;
  }
}

// This adds additional 'term' class to the editor
// to add custom editor styles inside customize-editor.css
const Anchor = ({children}) => (
  <span
    style={{
      backgroundColor: '#00FFFF',
    }}
  >
    {children}
  </span>
);

module.exports = {
  type: 'ANCHOR',
  source: AnchorSource,
  decorator: Anchor
};
