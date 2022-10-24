import ExampleTheme from "./themes/ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { $createParagraphNode, $getRoot } from "lexical";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";

import ToolbarPlugin from "./plugins/ToolbarPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import ReadOnlyPlugin from "./plugins/ReadOnlyPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import OnChangeMarkdown from "./plugins/OnChangeMarkdown";

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const editorConfig = {
  // The editor theme
  theme: ExampleTheme,
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode
  ]
};

export default function Editor(props) {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            initialEditorState={() => {
              let str = (props.value || "").replace(/\n\n<br>\n/g, "\n");

              // If we still have br tags, we're coming from Slate, apply
              // Slate list collapse and remove remaining br tags
              // https://github.com/facebook/lexical/issues/2208
              if (str.match(/<br>/g)) {
                str = str
                  .replace(/^(\n)(?=\s*[-+\d.])/gm, "")
                  .replace(/<br>/g, "");
              }

              str = str
                // Unescape HTML characters
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, "&")
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">");

              if (!str) {
                // if string is empty and this is not an update
                // don't bother trying to $convertFromMarkdown
                // below we properly initialize with the correct state allowing for
                // AutoFocus to work (as there is state to focus on), which works better
                // than $convertFromMarkdownString('')
                const root = $getRoot();
                const paragraph = $createParagraphNode();
                root.append(paragraph);
                return;
              }

              $convertFromMarkdownString(str, TRANSFORMERS);
            }}
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
          />

          <HistoryPlugin />

          <CodeHighlightPlugin />
          <ListPlugin />
          <LinkPlugin />
          <OnChangeMarkdown onChange={props.onChange} />
          <ReadOnlyPlugin isDisabled={props.isDisabled} />
          <AutoLinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
}
