export interface ToggleBlockProps {
  id: string;
  title: string;
  collapsed: boolean;
}

export function ToggleBlock({ id, title, collapsed }: ToggleBlockProps) {
  return (
    <div className="toggle-block" data-id={id} data-collapsed={collapsed}>
      <details open={!collapsed}>
        <summary className="cursor-pointer font-medium">{title}</summary>
        <div className="pl-4 mt-1 text-gray-600 text-sm">
          Toggle content will render here.
        </div>
      </details>
    </div>
  );
}
