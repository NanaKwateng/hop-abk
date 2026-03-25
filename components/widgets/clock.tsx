"use client";

import * as React from "react";

import {
    Widget,
    WidgetContent,
    WidgetTitle,
} from "@/components/ui/widget";

export default function Clock() {

    const [mounted, setMounted] = React.useState(false);
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
        // (Or just return null;)
    }

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const day = days[time.getDay()];

    const hours = time.getHours() % 12;
    const minutes = String(time.getMinutes()).padStart(2, "0");

    return (
        <Widget>
            <WidgetContent className="flex-col gap-2">
                <WidgetTitle className="text-2xl">{day}</WidgetTitle>
                <WidgetTitle className="text-5xl tracking-widest">
                    {hours}:{minutes}
                </WidgetTitle>
            </WidgetContent>
        </Widget>
    );
}



//npx shadcn@latest add @wigggle-ui/clock-sm-03