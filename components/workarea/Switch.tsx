import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SwitchDemo() {
    return (
        <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
        </div>
    )
}



import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field"

export function SwitchDescription() {
    return (
        <Field orientation="horizontal" className="max-w-sm">
            <FieldContent>
                <FieldLabel htmlFor="switch-focus-mode">
                    Share across devices
                </FieldLabel>
                <FieldDescription>
                    Focus is shared across devices, and turns off when you leave the app.
                </FieldDescription>
            </FieldContent>
            <Switch id="switch-focus-mode" />
        </Field>
    )
}


export function SwitchChoiceCard() {
    return (
        <FieldGroup className="w-full max-w-sm">
            <FieldLabel htmlFor="switch-share">
                <Field orientation="horizontal">
                    <FieldContent>
                        <FieldTitle>Share across devices</FieldTitle>
                        <FieldDescription>
                            Focus is shared across devices, and turns off when you leave the
                            app.
                        </FieldDescription>
                    </FieldContent>
                    <Switch id="switch-share" />
                </Field>
            </FieldLabel>
            <FieldLabel htmlFor="switch-notifications">
                <Field orientation="horizontal">
                    <FieldContent>
                        <FieldTitle>Enable notifications</FieldTitle>
                        <FieldDescription>
                            Receive notifications when focus mode is enabled or disabled.
                        </FieldDescription>
                    </FieldContent>
                    <Switch id="switch-notifications" defaultChecked />
                </Field>
            </FieldLabel>
        </FieldGroup>
    )
}
