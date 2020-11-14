import cf from 'clownface'
import $rdf from '@rdf-esm/dataset'
import { xsd } from '@tpluscode/rdf-ns-builders'
import { expect, fixture } from '@open-wc/testing'
import { RenderSingleEditor } from '@hydrofoil/shaperone-wc'
import { dateTimePicker, datePicker } from '../../components'
import { editorTestParams } from '../util'

describe('wc-material/components/date', () => {
  describe('datePicker', () => {
    let render: RenderSingleEditor

    before(async () => {
      render = await datePicker.lazyRender()
    })

    it('renders a mwc-textfield[type=date]', async () => {
      // given
      const graph = cf({ dataset: $rdf.dataset() })
      const { params, actions } = editorTestParams({
        object: graph.literal(''),
        datatype: xsd.date,
      })

      // when
      const element = await fixture(render(params, actions))

      // then
      expect(element).to.equalSnapshot()
    })
  })

  describe('dateTimePicker', () => {
    let render: RenderSingleEditor

    before(async () => {
      render = await dateTimePicker.lazyRender()
    })

    it('renders a mwc-textfield[type=datetime-local]', async () => {
      // given
      const graph = cf({ dataset: $rdf.dataset() })
      const { params, actions } = editorTestParams({
        object: graph.literal(''),
        datatype: xsd.date,
      })

      // when
      const element = await fixture(render(params, actions))

      // then
      expect(element).to.equalSnapshot()
    })
  })
})
