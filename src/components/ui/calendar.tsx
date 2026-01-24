"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-2 relative items-center gap-2",
        caption_label: "text-xs font-bold uppercase tracking-widest text-slate-400 h-0 w-0 overflow-hidden",
        caption_dropdowns: "flex justify-center gap-2 items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex px-1",
        head_cell:
          "text-slate-400 rounded-md w-9 font-bold text-[10px] uppercase tracking-widest text-center",
        row: "flex w-full mt-2 justify-center",
        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-medium aria-selected:opacity-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white focus:bg-emerald-600 focus:text-white rounded-xl shadow-lg shadow-emerald-200",
        day_today: "bg-slate-100 text-slate-900 font-bold border-2 border-white",
        day_outside:
          "day-outside text-slate-300 aria-selected:bg-emerald-50 aria-selected:text-emerald-600",
        day_disabled: "text-slate-200 opacity-50",
        day_range_middle:
          "aria-selected:bg-emerald-50 aria-selected:text-emerald-600",
        day_hidden: "invisible",
        dropdown: "flex items-center justify-between",
        dropdown_month: "flex items-center",
        dropdown_year: "flex items-center",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
