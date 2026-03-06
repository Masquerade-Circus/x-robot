/**
 * @module x-robot/utils/tree-adapter
 * @description Lightweight DOM implementation for SCXML parsing.
 * Inspired by valyrian.js tree-adapter (https://github.com/masquerade-circus/valyrian.js)
 */

// ==================== Type Definitions ====================

export interface Attr {
  nodeName: string;
  nodeValue: string;
}

// ==================== Base Node Class ====================

export class Node {
  nodeType: number = 0;
  nodeName: string = "";
  nodeValue: string = "";
  childNodes: Node[] = [];
  parentNode: Node | null = null;
  attributes: Attr[] = [];

  appendChild<T extends Node>(node: T): T {
    if (node) {
      node.parentNode && node.parentNode.removeChild(node);
      this.childNodes.push(node);
      node.parentNode = this;
    }
    return node;
  }

  removeChild<T extends Node>(child: T): T {
    const idx = this.childNodes.indexOf(child);
    if (idx > -1) {
      this.childNodes.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  cloneNode(deep?: boolean): Node {
    const node = new Node();
    node.nodeType = this.nodeType;
    node.nodeName = this.nodeName;
    node.nodeValue = this.nodeValue;
    if (this.attributes) {
      for (const attr of this.attributes) {
        const newAttr = { nodeName: attr.nodeName, nodeValue: attr.nodeValue };
        node.attributes.push(newAttr as Attr);
      }
    }
    if (deep) {
      for (const child of this.childNodes) {
        node.appendChild(child.cloneNode(deep));
      }
    }
    return node;
  }
}

// ==================== Element Class ====================

export class Element extends Node {
  nodeType = 1;

  get tagName(): string {
    return this.nodeName;
  }
  set tagName(name: string) {
    this.nodeName = name;
  }

  getAttribute(name: string): string | null {
    for (const attr of this.attributes) {
      if (attr.nodeName === name) {
        return attr.nodeValue;
      }
    }
    return null;
  }

  setAttribute(name: string, value: string): void {
    for (const attr of this.attributes) {
      if (attr.nodeName === name) {
        attr.nodeValue = value;
        return;
      }
    }
    this.attributes.push({ nodeName: name, nodeValue: value });
  }

  removeAttribute(name: string): void {
    const idx = this.attributes.findIndex((a) => a.nodeName === name);
    if (idx > -1) {
      this.attributes.splice(idx, 1);
    }
  }
}

// ==================== Text Class ====================

export class Text extends Node {
  nodeType = 3;
  nodeName = "#text";
  textContent: string = "";

  constructor(textContent: string = "") {
    super();
    this.textContent = textContent;
    this.nodeValue = textContent;
  }
}

// ==================== Document Class ====================

export class Document extends Element {
  nodeType = 9;
  nodeName = "#document";

  createElement(tagName: string): Element {
    const el = new Element();
    el.nodeName = tagName.toLowerCase();
    return el;
  }

  createTextNode(text: string): Text {
    return new Text(text);
  }
}

// ==================== XML Serialization ====================

// XML escaping for attributes and text content
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Convert DOM to XML string
export function domToXml(node: Node, indent: string = ""): string {
  if (node.nodeType === 3) {
    // Text node
    const text = node.nodeValue || (node as Text).textContent || "";
    return text ? escapeXml(text) : "";
  }

  if (node.nodeType === 1) {
    // Element
    const el = node as Element;
    const tagName = el.nodeName.toLowerCase();
    let xml = indent + "<" + tagName;

    // Add attributes
    for (const attr of el.attributes) {
      xml += ` ${attr.nodeName}="${escapeXml(attr.nodeValue)}"`;
    }

    // Check if has children
    if (el.childNodes.length > 0) {
      xml += ">\n";
      for (const child of el.childNodes) {
        xml += domToXml(child, indent + "  ") + "\n";
      }
      xml += indent + "</" + tagName + ">";
    } else {
      xml += "/>";
    }

    return xml;
  }

  return "";
}

// SCXML-specific serialization (handles self-closing for final states, etc.)
export function domToScxml(node: Node, indent: string = ""): string {
  if (node.nodeType === 3) {
    const text = node.nodeValue || (node as Text).textContent || "";
    return text ? escapeXml(text) : "";
  }

  if (node.nodeType === 1) {
    const el = node as Element;
    const tagName = el.nodeName.toLowerCase();
    let xml = indent + "<" + tagName;

    for (const attr of el.attributes) {
      xml += ` ${attr.nodeName}="${escapeXml(attr.nodeValue)}"`;
    }

    // Check for child elements
    const childElements = el.childNodes.filter((c) => c.nodeType === 1);
    const childTexts = el.childNodes.filter(
      (c) => c.nodeType === 3 && c.nodeValue.trim()
    );

    if (childElements.length > 0) {
      xml += ">\n";
      for (const child of el.childNodes) {
        xml += domToScxml(child, indent + "  ") + "\n";
      }
      xml += indent + "</" + tagName + ">";
    } else if (childTexts.length > 0) {
      xml += ">";
      for (const child of el.childNodes) {
        if (child.nodeType === 3) {
          xml += escapeXml(
            child.nodeValue || (child as Text).textContent || ""
          );
        }
      }
      xml += "</" + tagName + ">";
    } else {
      // Self-closing for empty elements
      xml += "/>";
    }

    return xml;
  }

  return "";
}

// ==================== XML Parser ====================

// Simple XML parser for SCXML subset using regex
// Does not need: namespaces, CDATA, comments, processing instructions, complex entities
export function parseXml(xmlString: string): Element {
  const doc = new Document();

  // Improved regex to correctly handle:
  // - Opening tags: <tag>
  // - Self-closing tags: <tag/> or <tag attr="value"/>
  // - Closing tags: </tag>
  const tagRegex = /<(\/?)([a-zA-Z_][\w.-]*)([^>]*?)(\/?)>/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let rootElement: Element | null = null;
  const elementStack: Element[] = [];

  while ((match = tagRegex.exec(xmlString)) !== null) {
    // Add text content between tags (whitespace handling)
    if (match.index > lastIndex) {
      const textContent = xmlString.substring(lastIndex, match.index);
      // Only add non-whitespace text to elements
      if (textContent.trim() && elementStack.length > 0) {
        elementStack[elementStack.length - 1].appendChild(
          doc.createTextNode(textContent.trim())
        );
      }
    }

    const isClosing = match[1] === "/";
    const tagName = match[2];
    const attrString = match[3];
    const isSelfClosing = match[4] === "/";

    // Skip if empty tag name (shouldn't happen with our regex)
    if (!tagName) {
      lastIndex = match.index + match[0].length;
      continue;
    }

    // Parse attributes
    const attrs: { nodeName: string; nodeValue: string }[] = [];
    const attrRegex = /([a-zA-Z_][\w.-]*)="([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      attrs.push({ nodeName: attrMatch[1], nodeValue: attrMatch[2] });
    }

    if (isClosing) {
      // Closing tag: </tag>
      if (elementStack.length > 0) {
        elementStack.pop();
      }
    } else if (isSelfClosing) {
      // Self-closing tag: <tag/> or <tag attr="value"/>
      const el = doc.createElement(tagName);
      for (const attr of attrs) {
        el.setAttribute(attr.nodeName, attr.nodeValue);
      }

      if (elementStack.length > 0) {
        elementStack[elementStack.length - 1].appendChild(el);
      } else if (!rootElement) {
        rootElement = el;
      }
    } else {
      // Opening tag: <tag> or <tag attr="value">
      const el = doc.createElement(tagName);
      for (const attr of attrs) {
        el.setAttribute(attr.nodeName, attr.nodeValue);
      }

      if (elementStack.length > 0) {
        elementStack[elementStack.length - 1].appendChild(el);
      } else {
        rootElement = el;
      }

      elementStack.push(el);
    }

    lastIndex = match.index + match[0].length;
  }

  return rootElement || doc.createElement("root");
}

// Parse SCXML string (handles the XML declaration)
export function parseScxml(scxmlString: string): Element {
  const cleanString = scxmlString.replace(/^<\?xml[^?]*\?>/, "").trim();
  return parseXml(cleanString);
}

// Singleton document instance
export const document = new Document();
