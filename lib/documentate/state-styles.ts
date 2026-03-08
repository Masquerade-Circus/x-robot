export const BUILT_IN_STATE_STYLE_ORDER = [
  "danger",
  "info",
  "warning",
  "success",
  "primary",
  "default"
] as const;

export type BuiltInStateStyleRole =
  typeof BUILT_IN_STATE_STYLE_ORDER[number];

const MERMAID_STATE_STYLE_ORDER: BuiltInStateStyleRole[] = [
  "danger",
  "warning",
  "success",
  "primary",
  "info",
  "default"
];

interface BuiltInStateStyle {
  mermaidClassName: string;
  mermaidDefinition: string;
  plantUmlStereotype: string;
  plantUmlBackgroundColor?: string;
  plantUmlBorderColor?: string;
}

const BUILT_IN_STATE_STYLES: Record<
  BuiltInStateStyleRole,
  BuiltInStateStyle
> = {
  danger: {
    mermaidClassName: "danger",
    mermaidDefinition:
      "fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24",
    plantUmlStereotype: "danger",
    plantUmlBackgroundColor: "Implementation",
    plantUmlBorderColor: "indianred"
  },
  warning: {
    mermaidClassName: "warning",
    mermaidDefinition:
      "fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404",
    plantUmlStereotype: "warning",
    plantUmlBackgroundColor: "Strategy",
    plantUmlBorderColor: "tan"
  },
  success: {
    mermaidClassName: "success",
    mermaidDefinition:
      "fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724",
    plantUmlStereotype: "success",
    plantUmlBackgroundColor: "Technology",
    plantUmlBorderColor: "mediumseagreen"
  },
  primary: {
    mermaidClassName: "primary",
    mermaidDefinition:
      "fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085",
    plantUmlStereotype: "primary",
    plantUmlBackgroundColor: "Motivation",
    plantUmlBorderColor: "lightsteelblue"
  },
  info: {
    mermaidClassName: "info",
    mermaidDefinition:
      "fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460",
    plantUmlStereotype: "info",
    plantUmlBackgroundColor: "Application",
    plantUmlBorderColor: "skyblue"
  },
  default: {
    mermaidClassName: "def",
    mermaidDefinition:
      "fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d",
    plantUmlStereotype: "default"
  }
};

function isBuiltInStateStyleRole(
  role: string
): role is BuiltInStateStyleRole {
  return BUILT_IN_STATE_STYLE_ORDER.includes(role as BuiltInStateStyleRole);
}

export function resolveStateStyleRole(type?: string): string {
  if (typeof type !== "string") {
    return "default";
  }

  const normalizedType = type.trim();

  if (normalizedType.length === 0) {
    return "default";
  }

  return normalizedType;
}

export function getMermaidStateClassName(type?: string): string {
  const role = resolveStateStyleRole(type);

  if (isBuiltInStateStyleRole(role)) {
    return BUILT_IN_STATE_STYLES[role].mermaidClassName;
  }

  return role;
}

export function getPlantUmlStateStereotype(type?: string): string {
  const role = resolveStateStyleRole(type);

  if (isBuiltInStateStyleRole(role)) {
    return BUILT_IN_STATE_STYLES[role].plantUmlStereotype;
  }

  return role;
}

export function getMermaidClassDefinitions(): string[] {
  return MERMAID_STATE_STYLE_ORDER.map((role) => {
    const { mermaidClassName, mermaidDefinition } = BUILT_IN_STATE_STYLES[role];
    return `classDef ${mermaidClassName} ${mermaidDefinition}`;
  });
}

export function getPlantUmlStateSkinparamLines(): string[] {
  return BUILT_IN_STATE_STYLE_ORDER.filter((role) => role !== "default").flatMap(
    (role) => {
      const style = BUILT_IN_STATE_STYLES[role];

      return [
        `BackgroundColor<<${style.plantUmlStereotype}>> ${style.plantUmlBackgroundColor}`,
        `BorderColor<<${style.plantUmlStereotype}>> ${style.plantUmlBorderColor}`
      ];
    }
  );
}
