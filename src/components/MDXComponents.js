import React from 'react';

export const MDXComponents = {
    h1: (props) => <h1 className="text-4xl font-bold my-6" {...props} />,
    h2: (props) => <h2 className="text-3xl font-semibold my-5" {...props} />,
    h3: (props) => <h3 className="text-2xl font-medium my-4" {...props} />,
    p: (props) => <p className="text-base leading-relaxed my-3" {...props} />,
    a: (props) => <a className="text-blue-600 underline" {...props} />,
    ul: (props) => <ul className="list-disc list-inside my-3" {...props} />,
    ol: (props) => <ol className="list-decimal list-inside my-3" {...props} />,
    li: (props) => <li className="my-1" {...props} />,
    pre: (props) => <pre className="bg-gray-100 p-4 rounded my-4 overflow-auto" {...props} />,
    code: (props) => <code className="font-mono bg-gray-100 px-1 rounded" {...props} />
};