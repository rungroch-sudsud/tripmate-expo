import React from 'react';
import { Text, View } from 'react-native';

const RichTextRenderer = ({ jsxString, fallbackText }) => {
  if (!jsxString || jsxString.trim() === '') {
    return <Text>{fallbackText || 'No content available'}</Text>;
  }

  // Parse the JSX string and convert it to React Native elements
  const parseJSXString = (jsx) => {
    if (!jsx) return null;

    // Split by newlines to handle line breaks
    const lines = jsx.split('\n');
    const elements = [];

    lines.forEach((line, lineIndex) => {
      if (line.includes('<br />')) {
        elements.push(<View key={`br-${lineIndex}`} style={{ height: 16 }} />);
        return;
      }

      if (line.trim() === '') return;

      // Parse Text components with styles
      const textMatches = line.match(/<Text([^>]*)>(.*?)<\/Text>/g);
      
      if (textMatches) {
        textMatches.forEach((match, matchIndex) => {
          const styleMatch = match.match(/style=\{\{([^}]+)\}\}/);
          const contentMatch = match.match(/<Text[^>]*>(.*?)<\/Text>/);
          
          if (contentMatch) {
            let content = contentMatch[1];
            let style = {};

            // Parse inline styles
            if (styleMatch) {
              const styleString = styleMatch[1];
              const styleProps = styleString.split(',').map(prop => prop.trim());
              
              styleProps.forEach(prop => {
                const [key, value] = prop.split(':').map(p => p.trim());
                if (key && value) {
                  const cleanKey = key.replace(/'/g, '');
                  let cleanValue = value.replace(/'/g, '');
                  
                  // Handle specific style conversions
                  if (cleanKey === 'fontWeight' && cleanValue === 'bold') {
                    style.fontWeight = 'bold';
                  } else if (cleanKey === 'fontStyle' && cleanValue === 'italic') {
                    style.fontStyle = 'italic';
                  } else if (cleanKey === 'textDecorationLine' && cleanValue === 'underline') {
                    style.textDecorationLine = 'underline';
                  } else if (cleanKey === 'textAlign') {
                    style.textAlign = cleanValue;
                  } else if (cleanKey === 'color') {
                    style.color = cleanValue;
                  } else if (cleanKey === 'fontFamily') {
                    style.fontFamily = cleanValue;
                  } else if (cleanKey === 'marginBottom') {
                    style.marginBottom = parseInt(cleanValue) || 0;
                  }
                }
              });
            }

            // Handle links
            const linkMatches = content.match(/<a href="([^"]*)" style="[^"]*">([^<]*)<\/a>/g);
            if (linkMatches) {
              const linkElements = [];
              let remainingContent = content;
              
              linkMatches.forEach((linkMatch, linkIndex) => {
                const linkHref = linkMatch.match(/href="([^"]*)"/)?.[1];
                const linkText = linkMatch.match(/>([^<]*)<\/a>/)?.[1];
                
                const beforeLink = remainingContent.split(linkMatch)[0];
                if (beforeLink) {
                  linkElements.push(
                    <Text key={`before-${linkIndex}`} style={style}>
                      {beforeLink}
                    </Text>
                  );
                }
                
                linkElements.push(
                  <Text
                    key={`link-${linkIndex}`}
                    style={[style, { color: '#007AFF', textDecorationLine: 'underline' }]}
                    onPress={() => {
                      // Handle link press - you might want to open URL
                      console.log('Link pressed:', linkHref);
                    }}
                  >
                    {linkText}
                  </Text>
                );
                
                remainingContent = remainingContent.split(linkMatch)[1] || '';
              });
              
              if (remainingContent) {
                linkElements.push(
                  <Text key={`after-links`} style={style}>
                    {remainingContent}
                  </Text>
                );
              }
              
              elements.push(
                <View key={`line-${lineIndex}-${matchIndex}`} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {linkElements}
                </View>
              );
            } else {
              elements.push(
                <Text key={`line-${lineIndex}-${matchIndex}`} style={[{ marginBottom: 4 }, style]}>
                  {content}
                </Text>
              );
            }
          }
        });
      } else {
        // Fallback for plain text lines
        elements.push(
          <Text key={`plain-${lineIndex}`} style={{ marginBottom: 4 }}>
            {line}
          </Text>
        );
      }
    });

    return elements;
  };

  const renderedElements = parseJSXString(jsxString);

  return (
    <View>
      {renderedElements}
    </View>
  );
};

export default RichTextRenderer;