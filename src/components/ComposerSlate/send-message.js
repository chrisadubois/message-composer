import Html from 'slate-html-serializer';
import Text from 'slate-plain-serializer';
import React from 'react';

import {convertMarkdown} from '../../plugins/markdown';

const BLOCK_TAGS = {
  blockquote: 'quote',
  p: 'paragraph',
  pre: 'code',
}

// Add a dictionary of mark tags.
const MARK_TAGS = {
  em: 'italic',
  strong: 'bold',
  u: 'underline',
}

const rules = [
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()]
      if (type) {
        return {
          object: 'block',
          type: type,
          data: {
            className: el.getAttribute('class'),
          },
          nodes: next(el.childNodes),
        }
      }
    },
    serialize(obj, children) {
      if (obj.object == 'block') {
        switch (obj.type) {
          case 'code':
            return (
              <pre>
                <code>{children}</code>
              </pre>
            )
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>
          case 'quote':
            return <blockquote>{children}</blockquote>
          }
        }
      },
    },
    // Add a new rule that handles marks...
    {
      deserialize(el, next) {
        const type = MARK_TAGS[el.tagName.toLowerCase()]
        if (type) {
          return {
            object: 'mark',
            type: type,
            nodes: next(el.childNodes),
          }
        }
      },
      serialize(obj, children) {
        if (obj.object == 'mark') {
          switch (obj.type) {
            case 'bold':
            return <strong>{children}</strong>
            case 'italic':
            return <em>{children}</em>
            case 'underline':
            return <u>{children}</u>
            case 'code':
            return (
              <pre>
                <code>{children}</code>
              </pre>
            )
          }
        }
      },
    },
  ];
  
  const html = new Html({ rules });

  const serializePlugin = (value) => {
    return {
      onKeyDown(event, editor, next) {
        if (!event.metaKey) return next();

        if (event.key === 'Enter') {
          event.preventDefault();

          for (const node of editor.value.document.nodes) {
            convertMarkdown(editor, node);
          }

          editor.props.send({
            displayName: Text.serialize(editor.value),
            content: html.serialize(editor.value),
          });
          editor.props.onChange({value});
          setTimeout(() => editor.focus());
          return true;
        }
        return next();
      }
    }
  }

  export default serializePlugin;