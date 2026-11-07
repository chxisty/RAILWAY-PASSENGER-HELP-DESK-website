'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageMarkdownProps {
  content: string;
  isUser?: boolean;
}

export default function ChatMessageMarkdown({ content, isUser = false }: ChatMessageMarkdownProps) {
  if (isUser) {
    return <div className="whitespace-pre-wrap leading-relaxed text-white font-medium">{content}</div>;
  }

  return (
    <div className="chat-markdown text-[13.5px] leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-extrabold tracking-wide">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic opacity-90">
              {children}
            </em>
          ),
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-extrabold mt-3.5 mb-2 border-b pb-1 flex items-center gap-1.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold mt-3 mb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold mt-2 mb-1">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="my-2 space-y-1.5 list-disc list-outside pl-5 marker:text-[#E67E48]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1.5 list-decimal list-outside pl-5 marker:text-[#E67E48] font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">
              {children}
            </li>
          ),
          a: ({ href, children }) => {
            const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
            return (
              <a
                href={href}
                target={isInternal ? '_self' : '_blank'}
                rel={isInternal ? undefined : 'noopener noreferrer'}
                className="underline font-semibold transition-colors"
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 pl-3.5 my-2.5 italic py-1.5 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isCodeBlock = className && className.includes('language-');
            if (isCodeBlock) {
              return (
                <code className="block p-3 rounded-lg border font-mono text-xs overflow-x-auto my-2">
                  {children}
                </code>
              );
            }
            return (
              <code
                className="px-1.5 py-0.5 rounded border font-mono text-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-2 border rounded-lg p-3 overflow-x-auto font-mono text-xs">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border shadow-inner">
              <table className="w-full text-xs text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b font-semibold">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="py-2.5 px-3 border font-bold">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="py-2 px-3 border">
              {children}
            </td>
          ),
          hr: () => <hr className="my-3 border-current/20" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
