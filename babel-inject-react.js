// Custom Babel plugin to inject React import
module.exports = function() {
  return {
    visitor: {
      Program: {
        enter(path, state) {
          // Check if React is already imported
          const hasReactImport = path.node.body.some(node => 
            node.type === 'ImportDeclaration' && 
            node.source.value === 'react'
          );
          
          // If React is not imported, add it
          if (!hasReactImport) {
            path.unshiftContainer('body', 
              require('@babel/types').importDeclaration(
                [require('@babel/types').importDefaultSpecifier(
                  require('@babel/types').identifier('React')
                )],
                require('@babel/types').stringLiteral('react')
              )
            );
          }
        }
      }
    }
  };
}; 