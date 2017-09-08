/// <reference types="node" />
import { Section } from './parseSection';
export declare class Epub {
    private _zip;
    private _opfPath;
    private _root;
    private _content;
    private _manifest;
    private _spine;
    private _toc;
    private _metadata;
    structure: GeneralObject;
    info: {
        title: string;
        author: string;
        publisher: string;
    };
    sections: Section[];
    constructor(buffer: any);
    resolve(path: string): {
        asText: () => string;
    };
    _resolveXMLAsJsObject(path: any): Promise<any>;
    private _getOpfPath();
    _getManifest(content: any): any[];
    _resolveIdFromLink(href: any): {};
    _getSpine(): any[];
    _genStructure(tocObj: any, resolveNodeId?: boolean): any;
    _resolveSectionsFromSpine(expand?: boolean): Section[];
    parse(expand?: boolean): Promise<this>;
}
export interface ParserOptions {
    type?: 'binaryString' | 'path' | 'buffer';
    expand?: boolean;
}
export default function parserWrapper(target: string | Buffer, options?: ParserOptions): Promise<Epub>;
