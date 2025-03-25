'use client'

import HtmlEditor from '@/components/HtmlEditor'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import MDEditor from '@uiw/react-md-editor'
import { filesize } from 'filesize'
import {
    Check,
    ChevronsUpDown,
    CloudUploadIcon,
    EyeIcon,
    EyeOffIcon,
    PenOffIcon,
    TrashIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Dispatch, JSX, SetStateAction, useState } from 'react'
import Dropzone, { DropzoneState } from 'shadcn-dropzone'
import { toast } from 'sonner'
import { ZodSchema } from 'zod'
import { DateTimePicker } from './DateTime'
import { MultiSelect } from './MultiSelect'
import { Badge } from './ui/badge'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Switch } from './ui/switch'

export type JFormInputField = {
    type: 'input'
    label: string
    value: string
    setValue?: (value: string) => void
    validator?: ZodSchema
    disabled?: boolean
    placeHolder?: string
}

export type JFormNumberField = {
    type: 'number'
    label: string
    value: number
    setValue?: (value: number) => void
    validator?: ZodSchema
    disabled?: boolean
    placeHolder?: string
}

export type JFormPasswordField = {
    type: 'password'
    label: string
    value: string | null
    setValue?: (value: string) => void
    validator?: ZodSchema
    disabled?: boolean
    placeHolder?: string
}

export type JFormTextareaField = {
    type: 'textarea'
    label: string
    value: string
    setValue: (value: string) => void
    validator?: ZodSchema
    disabled?: boolean
    placeHolder?: string
}

export type JFormHtmlField = {
    type: 'html'
    label: string
    value: string
    setValue: (value: string) => void
    validator?: ZodSchema
    disabled?: boolean
    placeHolder?: string
}

export type JFormMarkdownField = {
    type: 'markdown'
    label: string
    value: string
    setValue?: (value: string) => void
    validator?: ZodSchema
    disabled?: boolean
    placeHolder?: string
}

export type JFormFileField = {
    type: 'file'
    label: string
    value: File | null
    setValue: Dispatch<SetStateAction<File | null>>
    validator?: ZodSchema
    accept?: string[]
    disabled?: boolean
}

export type JFormSwitchField = {
    type: 'switch'
    label: string
    value: boolean
    setValue: (value: boolean) => void
    disabled?: boolean
}

export type JFormDateTimeField = {
    type: 'datetime'
    label: string
    value: string
    setValue?: (value: string) => void
    disabled?: boolean
    placeHolder?: string
}

export type JSelectField = {
    type: 'select'
    label: string
    value: string | null
    setValue: (value: string | null) => void
    options: { value: string; label: string }[]
    disabled?: boolean
}

export type JMultiSelectField = {
    type: 'multiSelect'
    label: string
    value: string[]
    setValue: (value: string[]) => void
    options: { value: string; label: string }[]
    disabled?: boolean
}

export type JRadioField = {
    type: 'radio'
    label: string
    value: string
    setValue: (value: string) => void
    options: { value: string; label: string }[]
    disabled?: boolean
}

export type JFormButtonField = {
    type: 'button'
    text: string
    icon?: JSX.Element
    action?: () => Promise<void>
    ignoreValidation?: boolean
}

export type JFormFreeField = {
    type: 'free'
    label: JSX.Element | string
    content: JSX.Element | string
}

export type JFormSeparatorField = {
    type: 'separator'
}

export type JFormField =
    | JFormInputField
    | JFormNumberField
    | JFormPasswordField
    | JFormTextareaField
    | JFormHtmlField
    | JFormMarkdownField
    | JFormFileField
    | JFormSwitchField
    | JFormDateTimeField
    | JFormButtonField
    | JSelectField
    | JMultiSelectField
    | JRadioField
    | JFormFreeField
    | JFormSeparatorField

export type JFormFields = Record<string, JFormField>

export type JFormProps = {
    fields: JFormFields
    className?: string
}

export function JForm(props: JFormProps) {
    const [errors, setErrors] = useState<Record<string, string | undefined>>({})

    async function validate(): Promise<boolean> {
        let ok = true
        setErrors({})
        for (const fieldKey in props.fields) {
            const field = props.fields[fieldKey]
            if ('validator' in field && field.validator) {
                const result = field.validator.safeParse(field.value)
                if (!result.success) {
                    let message = ''
                    for (const error of result.error.errors) {
                        message += error.message + '. '
                    }
                    setErrors((prev) => ({ ...prev, [fieldKey]: message }))

                    ok = false
                }
            }
        }
        return ok
    }

    return (
        <div className={cn('w-full mb-4', props.className)}>
            <div className={cn('w-full flex flex-row justify-center')}>
                <div className="w-full md:w-5/6 space-y-3">
                    {Object.entries(props.fields).map(([fieldKey, field]) => (
                        <JComponent
                            key={fieldKey}
                            fieldKey={fieldKey}
                            validate={validate}
                            field={field}
                            errors={errors}
                            setErrors={setErrors}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

interface JComponentProps {
    fieldKey: string
    field: JFormField
    validate: () => Promise<boolean>
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JComponent(props: JComponentProps) {
    switch (props.field.type) {
        case 'input':
            return (
                <JInputComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'number':
            return (
                <JNumberComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'password':
            return (
                <JPasswordComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'textarea':
            return (
                <JTextareaComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'html':
            return (
                <JHtmlComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'markdown':
            return (
                <JMarkdownComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'file':
            return (
                <JFileComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                    accept={props.field.accept}
                />
            )
        case 'switch':
            return (
                <JSwitchComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'datetime':
            return (
                <JDateTimeComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'select':
            return (
                <JSelectComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'multiSelect':
            return (
                <JMultiSelectComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'radio':
            return (
                <JRadioComponent
                    fieldKey={props.fieldKey}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                />
            )
        case 'button':
            return (
                <JButtonComponent
                    fieldKey={props.fieldKey}
                    validate={props.validate}
                    field={props.field}
                    errors={props.errors}
                    setErrors={props.setErrors}
                    ignoreValidation={props.field.ignoreValidation}
                />
            )
        case 'free':
            return <JFreeComponent field={props.field} fieldKey={props.fieldKey} />
        case 'separator':
            return <JSeparatorComponent field={props.field} fieldKey={props.fieldKey} />
    }
}

interface JInputComponentProps {
    fieldKey: string
    field: JFormInputField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JInputComponent(props: JInputComponentProps) {
    function validate(value: string) {
        if (props.field.validator) {
            const result = props.field.validator.safeParse(value)
            if (!result.success) {
                let message = ''
                for (const error of result.error.errors) {
                    message += error.message + '. '
                }
                props.setErrors((prev) => ({ ...prev, [props.fieldKey]: message }))
            } else {
                props.setErrors((prev) => ({ ...prev, [props.fieldKey]: undefined }))
            }
        }
    }

    function change(value: string) {
        validate(value)
        if (props.field.setValue) props.field.setValue(value)
    }

    const iconClass = 'absolute right-0 top-0 m-2.5 h-4 w-4 text-muted-foreground'
    let icon = null
    if (!props.field.setValue) {
        icon = <PenOffIcon className={iconClass} />
    }

    const content = (
        <div className="relative w-full">
            <Input
                className={cn('w-full', icon ? 'pr-10' : '')}
                value={props.field.value}
                onChange={(e) => change(e.target.value)}
                disabled={props.field.disabled}
                placeholder={props.field.placeHolder || ''}
            />
            {icon}
        </div>
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JNumberComponentProps {
    fieldKey: string
    field: JFormNumberField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JNumberComponent(props: JNumberComponentProps) {
    function validate(value: number) {
        if (props.field.validator) {
            const result = props.field.validator.safeParse(value)
            if (!result.success) {
                let message = ''
                for (const error of result.error.errors) {
                    message += error.message + '. '
                }
                props.setErrors((prev) => ({ ...prev, [props.fieldKey]: message }))
            } else {
                props.setErrors((prev) => ({ ...prev, [props.fieldKey]: undefined }))
            }
        }
    }

    function change(value: string) {
        const intValue = parseInt(value)
        validate(intValue)
        if (props.field.setValue) props.field.setValue(intValue)
    }

    const content = (
        <Input
            value={props.field.value}
            type="number"
            onChange={(e) => change(e.target.value)}
            disabled={props.field.disabled}
            placeholder={props.field.placeHolder || ''}
            className="w-32"
        />
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JPasswordComponentProps {
    fieldKey: string
    field: JFormPasswordField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JPasswordComponent(props: JPasswordComponentProps) {
    const [showPassword, setShowPassword] = useState(false)

    if (props.field.value === null) {
        return null
    }

    if (props.field.value === null) {
        // alternative
        return (
            <JFieldComponent
                label={props.field.label}
                content={
                    <Badge className="mt-2" variant="secondary">
                        None
                    </Badge>
                }
                error={props.errors[props.fieldKey]}
            />
        )
    }

    function validate(value: string) {
        if (props.field.validator) {
            const result = props.field.validator.safeParse(value)
            if (!result.success) {
                let message = ''
                for (const error of result.error.errors) {
                    message += error.message + '. '
                }
                props.setErrors((prev) => ({ ...prev, [props.fieldKey]: message }))
            } else {
                props.setErrors((prev) => ({ ...prev, [props.fieldKey]: undefined }))
            }
        }
    }

    function change(value: string) {
        validate(value)
        if (props.field.setValue) props.field.setValue(value)
    }

    const content = (
        <div className="flex flex-row gap-4">
            <Input
                value={props.field.value}
                onChange={(e) => change(e.target.value)}
                disabled={props.field.disabled}
                placeholder={props.field.placeHolder || ''}
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
            />
            <Button
                type="button"
                variant="outline"
                className=""
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={props.field.disabled}
            >
                {showPassword && !props.field.disabled ? (
                    <EyeIcon className="h-4 w-4" />
                ) : (
                    <EyeOffIcon className="h-4 w-4" />
                )}
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
            </Button>
        </div>
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JTextareaComponentProps {
    fieldKey: string
    field: JFormTextareaField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JTextareaComponent(props: JTextareaComponentProps) {
    const content = (
        <Textarea
            value={props.field.value}
            onChange={(e) => props.field.setValue(e.target.value)}
            disabled={props.field.disabled}
            placeholder={props.field.placeHolder || ''}
        />
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JHtmlComponentProps {
    fieldKey: string
    field: JFormHtmlField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JHtmlComponent(props: JHtmlComponentProps) {
    const content = <HtmlEditor value={props.field.value} onChange={props.field.setValue} />

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JMarkdownComponentProps {
    fieldKey: string
    field: JFormMarkdownField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JMarkdownComponent(props: JMarkdownComponentProps) {
    const theme = useTheme()

    const content = (
        <MDEditor
            className="mx-[1px]"
            data-color-mode={theme.theme === 'dark' ? 'dark' : 'light'}
            height={200}
            value={props.field.value}
            onChange={(v) => {
                if (props.field.setValue) props.field.setValue(v || '')
            }}
            textareaProps={{
                placeholder: props.field.placeHolder || '',
                // maxLength: 10,
            }}
            toolbarBottom={true}
        />
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JFileComponentProps {
    fieldKey: string
    field: JFormFileField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
    accept?: string[]
}

function JFileComponent(props: JFileComponentProps) {
    const content = (
        <div className="">
            <DropzoneSingle
                fieldKey={props.fieldKey}
                file={props.field.value}
                set={props.field.setValue}
                accept={props.accept}
                errors={props.errors}
                setErrors={props.setErrors}
            />
        </div>
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JSwitchComponentProps {
    fieldKey: string
    field: JFormSwitchField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JSwitchComponent(props: JSwitchComponentProps) {
    // the height of switch is strange, thus the pt-2

    const content = (
        <div className="pt-2">
            <div className="flex flex-row gap-2">
                <Switch
                    checked={props.field.value}
                    onCheckedChange={props.field.setValue}
                    disabled={props.field.disabled}
                />
                <span className="text-sm">{props.field.value ? 'Yes' : 'No'}</span>
            </div>
        </div>
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JDateTimeComponentProps {
    fieldKey: string
    field: JFormDateTimeField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JDateTimeComponent(props: JDateTimeComponentProps) {
    const content = (
        <div className="">
            <DateTimePicker
                value={new Date(props.field.value)}
                onChange={(date: Date | undefined) => {
                    if (date && props.field.setValue) {
                        props.field.setValue(date.toISOString())
                    }
                }}
            />
        </div>
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JSelectComponentProps {
    fieldKey: string
    field: JSelectField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JSelectComponent(props: JSelectComponentProps) {
    const [open, setOpen] = useState(false)

    const content = (
        <div className="">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {props.field.value !== null
                            ? props.field.options.find(
                                  (framework) => framework.value === props.field.value,
                              )?.label
                            : ''}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 shadow-xl">
                    <Command>
                        <CommandInput
                            placeholder={`Search ${props.field.label.toLowerCase()}...`}
                            className="h-9"
                        />
                        <CommandList>
                            <ScrollArea className="h-48">
                                <CommandEmpty>
                                    No {props.field.label.toLowerCase()} found.
                                </CommandEmpty>
                                <CommandGroup>
                                    {props.field.options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            onSelect={(currentValue) => {
                                                props.field.setValue(
                                                    currentValue === props.field.value
                                                        ? ''
                                                        : currentValue,
                                                )
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    'p-0',
                                                    props.field.value === option.value
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                            <div
                                                className={
                                                    props.field.value === option.value
                                                        ? 'font-bold'
                                                        : ''
                                                }
                                            >
                                                {option.label}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </ScrollArea>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JMultiSelectComponentProps {
    fieldKey: string
    field: JMultiSelectField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JMultiSelectComponent(props: JMultiSelectComponentProps) {
    const content = (
        <div className="">
            <MultiSelect
                options={props.field.options}
                onValueChange={props.field.setValue}
                defaultValue={props.field.value}
                placeholder={`Select ${props.field.label.toLowerCase()}`}
                variant="secondary"
            />
        </div>
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JRadioComponentProps {
    fieldKey: string
    field: JRadioField
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JRadioComponent(props: JRadioComponentProps) {
    const content = (
        <div className="mt-3">
            <RadioGroup onValueChange={props.field.setValue} defaultValue={props.field.value}>
                {props.field.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} />
                        <Label>{option.label}</Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    )

    return (
        <JFieldComponent
            label={props.field.label}
            content={content}
            error={props.errors[props.fieldKey]}
        />
    )
}

interface JButtonComponentProps {
    fieldKey: string
    field: JFormButtonField
    validate: () => Promise<boolean>
    validator?: any // TODO: find type
    ignoreValidation?: boolean
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
}

function JButtonComponent(props: JButtonComponentProps) {
    async function pressAction() {
        if (props.ignoreValidation) {
            if (props.field.action) {
                await props.field.action()
            }
        } else {
            const ok = await props.validate()
            if (ok) {
                if (props.field.action) {
                    await props.field.action()
                }
            } else {
                toast.error('Please correct the errors in the form.')
            }
        }
    }

    const content = (
        <Button className="w-40 justify-start" onClick={() => pressAction()}>
            {props.field.icon}
            {props.field.text}
        </Button>
    )

    return <JFieldComponent label="" content={content} />
}

interface JFreeComponentProps {
    fieldKey: string
    field: JFormFreeField
}

function JFreeComponent(props: JFreeComponentProps) {
    const content = props.field.content

    return <JFieldComponent label={props.field.label} content={content} />
}

interface JSeparatorComponentProps {
    fieldKey: string
    field: JFormSeparatorField
}

function JSeparatorComponent(props: JSeparatorComponentProps) {
    const content = (
        <div className="mt-4 mb-2">
            <div className="border-t border-neutral-300" />
        </div>
    )

    return <JFieldComponent label="" content={content} />
}

interface JFieldComponentProps {
    label: JSX.Element | string
    content: JSX.Element | string
    error?: JSX.Element | string
}

function JFieldComponent(props: JFieldComponentProps) {
    return (
        <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Label className="mt-3 font-bold sm:w-[30ex] sm:text-right">
                <span className={props.error ? 'text-red-700 dark:red-text-400' : ''}>
                    {props.label}
                </span>
            </Label>
            <div className="w-full">
                <div>{props.content}</div>
                {props.error && (
                    <div className="text-red-700 dark:red-text-400 text-xs ml-2 mt-1">
                        {props.error}
                    </div>
                )}
            </div>
        </div>
    )
}

interface DropzoneSingleProps {
    fieldKey: string
    file: File | null
    set: (f: File | null) => void
    errors: Record<string, string | undefined>
    setErrors: Dispatch<SetStateAction<Record<string, string | undefined>>>
    accept?: string[]
}

function DropzoneSingle(props: DropzoneSingleProps) {
    return (
        <>
            <Dropzone
                onDrop={(addedFiles: File[]) => {
                    if (addedFiles.length >= 1) {
                        props.set(null)
                        props.setErrors((prev) => ({
                            ...prev,
                            [props.fieldKey]: undefined,
                        }))
                        const addedFile = addedFiles[addedFiles.length - 1]
                        if (props.accept && !props.accept.includes(addedFile.type)) {
                            props.setErrors((prev) => ({
                                ...prev,
                                [props.fieldKey]: 'Invalid file type',
                            }))
                            return
                        }
                        props.set(addedFile)
                    }
                }}
            >
                {(dropzone: DropzoneState) => (
                    <div className="w-96 h-28 pt-5 flex flex-col items-center text-xs">
                        <CloudUploadIcon className="w-8 h-8" strokeWidth={1} />
                        <div className="pt-2">Drag and drop your file here or click to select.</div>
                        {props.accept && <div>Accepted types: {props.accept.join(', ')}.</div>}
                    </div>
                )}
            </Dropzone>
            <div>
                {props.file === null ? null : (
                    <div className="mt-2 p-1 flex flex-row gap-2 text-sm rounded border">
                        <Badge variant="secondary" className="min-w-24 justify-center">
                            {props.file.name}
                        </Badge>
                        <Badge variant="secondary" className="">
                            {props.file.type}
                        </Badge>
                        <Badge variant="secondary" className="">
                            {filesize(props.file.size, { standard: 'jedec' })}
                        </Badge>
                        <div className="flex-grow" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                props.set(null)
                                props.setErrors((prev) => ({
                                    ...prev,
                                    [props.fieldKey]: undefined,
                                }))
                            }}
                        >
                            <TrashIcon />
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}
