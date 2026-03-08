export declare const BUILT_IN_STATE_STYLE_ORDER: readonly ["danger", "info", "warning", "success", "primary", "default"];
export declare type BuiltInStateStyleRole = typeof BUILT_IN_STATE_STYLE_ORDER[number];
export declare function resolveStateStyleRole(type?: string): string;
export declare function getMermaidStateClassName(type?: string): string;
export declare function getPlantUmlStateStereotype(type?: string): string;
export declare function getMermaidClassDefinitions(): string[];
export declare function getPlantUmlStateSkinparamLines(): string[];
//# sourceMappingURL=state-styles.d.ts.map