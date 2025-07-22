import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { $getRoot, $getSelection } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ToolbarPlugin } from './ToolbarPlugin'; // We'll create this
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

// Error Message Component (assuming you have this)
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</Text>;
};

// Custom toolbar component
const ToolbarPlugin = () => {
  return (
    <View style={toolbarStyles.toolbar}>
      {/* Add your toolbar buttons here - Bold, Italic, Lists, etc. */}
      <Text style={toolbarStyles.toolbarText}>Normal</Text>
      {/* We'll implement toolbar buttons based on your needs */}
    </View>
  );
};

// Plugin to handle content changes
function OnChangeContentPlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  
  const handleChange = useCallback((editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      onChange(textContent);
    });
  }, [onChange]);

  return <OnChangePlugin onChange={handleChange} />;
}

// Plugin to set initial content
function InitialContentPlugin({ value }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (value && value !== editor.getEditorState().read(() => $getRoot().getTextContent())) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode().append($createTextNode(value)));
      });
    }
  }, [value, editor]);

  return null;
}

export const RichTextDetailsInputComponent = ({
  value,
  onChangeText,
  error,
  clearError,
  styles,
  isEditMode = false
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounce function
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Debounced version of onChangeText
  const debouncedOnChangeText = useCallback(
    debounce((text) => {
      onChangeText(text);
    }, 150),
    [onChangeText]
  );

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleTextChange = (text) => {
    setLocalValue(text);
    debouncedOnChangeText(text);
  };

  // Lexical configuration
  const initialConfig = {
    namespace: 'DetailsEditor',
    theme: {
      root: 'editor-root',
      paragraph: 'editor-paragraph',
      text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
      },
      list: {
        ol: 'editor-list-ol',
        ul: 'editor-list-ul',
        listitem: 'editor-listitem',
      },
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      AutoLinkNode,
      LinkNode,
    ],
    onError: (error) => {
      console.error('Lexical Error:', error);
    },
  };

  return (
    <View style={styles.container3}>
      <Text style={styles.label}>รายละเอียดทั่วไป</Text>
      
      <View style={[
        richTextStyles.editorContainer,
        error && styles.inputError
      ]}>
        <LexicalComposer initialConfig={initialConfig}>
          {/* Toolbar */}
          <View style={richTextStyles.toolbarContainer}>
            <ToolbarPlugin />
          </View>
          
          {/* Editor */}
          <View style={richTextStyles.editorWrapper}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  style={richTextStyles.contentEditable}
                  placeholder="เขียนรายละเอียดทริปของคุณ..."
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangeContentPlugin onChange={handleTextChange} />
            <InitialContentPlugin value={localValue} />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
          </View>
        </LexicalComposer>
      </View>
      
      {!isEditMode && <ErrorMessage error={error} />}
    </View>
  );
};

// Styles for the rich text editor
const richTextStyles = {
  editorContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 120, // Slightly taller to accommodate toolbar
    overflow: 'hidden',
  },
  toolbarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editorWrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  contentEditable: {
    minHeight: 80,
    fontSize: 14,
    fontFamily: 'LineSeedSansTH',
    color: '#374151',
    lineHeight: 20,
    outline: 'none',
    border: 'none',
    resize: 'none',
  },
};

const toolbarStyles = {
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toolbarText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'LineSeedSansTH',
  },
};