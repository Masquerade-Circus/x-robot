export interface Attr {
    nodeName: string;
    nodeValue: string;
}
export declare class Node {
    nodeType: number;
    nodeName: string;
    nodeValue: string;
    childNodes: Node[];
    parentNode: Node | null;
    attributes: Attr[];
    appendChild<T extends Node>(node: T): T;
    removeChild<T extends Node>(child: T): T;
    cloneNode(deep?: boolean): Node;
}
export declare class Element extends Node {
    nodeType: number;
    get tagName(): string;
    set tagName(name: string);
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
}
export declare class Text extends Node {
    nodeType: number;
    nodeName: string;
    textContent: string;
    constructor(textContent?: string);
}
export declare class Document extends Element {
    nodeType: number;
    nodeName: string;
    createElement(tagName: string): Element;
    createTextNode(text: string): Text;
}
export declare function domToXml(node: Node, indent?: string): string;
export declare function domToScxml(node: Node, indent?: string): string;
export declare function parseXml(xmlString: string): Element;
export declare function parseScxml(scxmlString: string): Element;
export declare const document: Document;
//# sourceMappingURL=tree-adapter.d.ts.map