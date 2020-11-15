import { Lazy, SingleEditorComponent } from '@hydrofoil/shaperone-wc'
import { dash } from '@tpluscode/rdf-ns-builders'
import { namedNode } from '@rdf-esm/data-model'

export const textField: Lazy<SingleEditorComponent> = {
  editor: dash.TextFieldEditor,
  async lazyRender() {
    const { createTextField } = await import('./components/textField')
    return createTextField()
  },
}

export const urlEditor: Lazy<SingleEditorComponent> = {
  editor: dash.URIEditor,
  async lazyRender() {
    const { createTextField } = await import('./components/textField')
    return createTextField({
      type: 'url',
      createTerm: value => namedNode(value),
    })
  },
}

export const textArea: Lazy<SingleEditorComponent> = {
  editor: dash.TextAreaEditor,
  lazyRender() {
    return import('./components/textArea').then(m => m.textArea)
  },
}

export const enumSelect: Lazy<SingleEditorComponent> = {
  editor: dash.EnumSelectEditor,
  lazyRender() {
    return import('./components/enumSelect').then(m => m.enumSelect)
  },
}

export const datePicker: Lazy<SingleEditorComponent> = {
  editor: dash.DatePickerEditor,
  async lazyRender() {
    const { createTextField } = await import('./components/textField')
    return createTextField({ type: 'date' })
  },
}

export const dateTimePicker: Lazy<SingleEditorComponent> = {
  editor: dash.DateTimePickerEditor,
  async lazyRender() {
    const { createTextField } = await import('./components/textField')
    return createTextField({ type: 'datetime-local' })
  },
}
