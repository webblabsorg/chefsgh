import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  yearRange?: { from: number; to: number };
};

interface CustomCaptionProps {
  displayMonth: Date;
  yearRange?: { from: number; to: number };
  onMonthChange?: (month: Date) => void;
}

function CustomCaption({ displayMonth, yearRange, onMonthChange }: CustomCaptionProps) {
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();

  const startYear = yearRange?.from || 1940;
  const endYear = yearRange?.to || new Date().getFullYear() + 10;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleMonthChange = (monthName: string) => {
    const newDate = new Date(currentYear, months.indexOf(monthName));
    onMonthChange?.(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(parseInt(year), currentMonth);
    onMonthChange?.(newDate);
  };

  return (
    <div className="flex justify-center gap-2 mb-2">
      <Select value={months[currentMonth]} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[130px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={currentYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[100px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {years.reverse().map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  yearRange,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.month || new Date());

  React.useEffect(() => {
    if (props.month) {
      setMonth(props.month);
    }
  }, [props.month]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={month}
      onMonthChange={setMonth}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md'
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100'
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
        Caption: (captionProps) => <CustomCaption {...captionProps} yearRange={yearRange} onMonthChange={setMonth} />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
