import { ReactNode } from "react";

interface SectionHeadingProps { eyebrow: string; title: string; action: ReactNode }

export default function SectionHeading({ eyebrow, title, action }: SectionHeadingProps) {
    return (
        <div className="section-heading">
            <div>
                <p className="eyebrow">{eyebrow}</p>
                <h2>{title}</h2>
            </div>
            {action}
        </div>)
}
