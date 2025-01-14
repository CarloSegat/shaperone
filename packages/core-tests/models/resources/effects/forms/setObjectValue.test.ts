import { describe, it } from 'mocha'
import clownface, { AnyContext, AnyPointer } from 'clownface'
import $rdf from 'rdf-ext'
import type DatasetExt from 'rdf-ext/lib/Dataset'
import { schema, sh } from '@tpluscode/rdf-ns-builders'
import { expect } from 'chai'
import { testStore } from '@shaperone/testing/models/form'
import setObjectValue from '@hydrofoil/shaperone-core/models/resources/effects/forms/setObjectValue'
import { Store } from '@hydrofoil/shaperone-core/state'
import { propertyShape } from '@shaperone/testing/util'

describe('models/resources/effects/forms/setObject', () => {
  let store: Store
  let graph: AnyPointer<AnyContext, DatasetExt>
  let form: symbol

  describe('focus node in default graph', () => {
    beforeEach(() => {
      ({ form, store } = testStore({ factory: $rdf }));
      ({ graph } = store.getState().resources.get(form) as any)
    })

    it('removes old value from graph', () => {
    // given
      const focusNode = graph.blankNode()
        .addOut(schema.age, ['5', '15'])
      const object = {
        object: focusNode.literal('5'),
      }
      const newValue = $rdf.literal('10')
      const property = propertyShape({
        path: schema.age,
      })

      // when
      setObjectValue(store)({
        form,
        focusNode,
        object,
        newValue,
        property,
      })

      // then
      expect(focusNode.out(schema.age).terms).to.deep.contain.members([
        $rdf.literal('10'),
        $rdf.literal('15'),
      ])
    })

    it('adds new value if old was undefined', () => {
    // given
      const focusNode = graph.blankNode()
        .addOut(schema.age, ['5', '15'])
      const object = {
        object: undefined,
      }
      const newValue = $rdf.literal('10')
      const property = propertyShape({
        path: schema.age,
      })

      // when
      setObjectValue(store)({
        form,
        focusNode,
        newValue,
        property,
        object,
      })

      // then
      expect(focusNode.out(schema.age).terms).to.deep.contain.members([
        $rdf.literal('5'),
        $rdf.literal('10'),
        $rdf.literal('15'),
      ])
    })

    it('removes blank node subgraphs not referenced any more', () => {
    // given
      const focusNode = graph
        .namedNode('propertyShape')
        .addOut(sh.path, (path) => {
          path.addOut(sh.inversePath, (inverse) => {
            inverse.addOut(sh.zeroOrOnePath, schema.name)
          })
        })
      const object = {
        object: focusNode.out(sh.path).toArray().shift(),
      }
      const shapesGraph = clownface({ dataset: $rdf.dataset() })
      const property = propertyShape(shapesGraph.blankNode(), {
        path: sh.path,
      })
      const newValue = schema.name

      // when
      setObjectValue(store)({
        form,
        focusNode,
        newValue,
        property,
        object,
      })

      // then
      const expected = clownface({ dataset: $rdf.dataset() }).namedNode('propertyShape')
      expected.addOut(sh.path, schema.name)
      expect(focusNode.dataset.toCanonical()).to.eq(expected.dataset.toCanonical())
    })

    it('replaces one subgraph with another', () => {
    // given
      const focusNode = graph
        .namedNode('propertyShape')
        .addOut(sh.path, (path) => {
          path.addOut(sh.inversePath, (inverse) => {
            inverse.addOut(sh.zeroOrOnePath, schema.name)
          })
        })
      const object = {
        object: focusNode.out(sh.path).toArray().shift(),
      }
      const shapesGraph = clownface({ dataset: $rdf.dataset() })
      const property = propertyShape(shapesGraph.blankNode(), {
        path: sh.path,
      })
      const newValue = clownface({ dataset: $rdf.dataset() })
        .blankNode()
        .addList(sh.alternativePath, [schema.knows, schema.name])

      // when
      setObjectValue(store)({
        form,
        focusNode,
        newValue,
        property,
        object,
      })

      // then
      const expected = clownface({ dataset: $rdf.dataset() }).namedNode('propertyShape')
      expected.addOut(sh.path, path => path.addList(sh.alternativePath, [schema.knows, schema.name]))
      expect(focusNode.dataset.toCanonical()).to.eq(expected.dataset.toCanonical())
    })

    it('does not remove subgraph if used multiple times in the data graph', () => {
    // given
      const location = graph.blankNode().addOut(schema.streetAddress, 'Wisteria Lane')
      const focusNode = graph
        .namedNode('fn')
        .addOut(schema.employmentUnit, (empl) => {
          empl.addOut(schema.location, location)
        })
        .addOut(schema.address, location)
      const object = {
        object: focusNode.out(schema.employmentUnit).toArray().shift(),
      }
      const shapesGraph = clownface({ dataset: $rdf.dataset() })
      const property = propertyShape(shapesGraph.blankNode(), {
        path: schema.employmentUnit,
      })
      const newValue = $rdf.namedNode('external-id')

      // when
      setObjectValue(store)({
        form,
        focusNode,
        newValue,
        property,
        object,
      })

      // then
      const expected = clownface({ dataset: $rdf.dataset() }).namedNode('fn')
        .addOut(schema.address, (location) => {
          location.addOut(schema.streetAddress, 'Wisteria Lane')
        })
        .addOut(schema.employmentUnit, $rdf.namedNode('external-id'))
      expect(focusNode.dataset.toCanonical()).to.eq(expected.dataset.toCanonical())
    })
  })

  describe('focus node in named graph', () => {
    const namedGraph = $rdf.namedNode('named-graph')

    beforeEach(() => {
      ({ form, store } = testStore({ factory: $rdf, graph: namedGraph }));
      ({ graph } = store.getState().resources.get(form) as any)
    })

    it("adds quads to focus node's graph", () => {
      // given
      const focusNode = graph
        .namedNode('propertyShape')
      const object = {
        object: focusNode.out(sh.path).toArray().shift(),
      }
      const shapesGraph = clownface({ dataset: $rdf.dataset() })
      const property = propertyShape(shapesGraph.blankNode(), {
        path: sh.path,
      })
      const newValue = clownface({ dataset: $rdf.dataset() })
        .blankNode()
        .addOut(sh.inversePath, schema.knows)

      // when
      setObjectValue(store)({
        form,
        focusNode,
        newValue,
        property,
        object,
      })

      // then
      const expected = clownface({
        dataset: $rdf.dataset(),
        graph: namedGraph,
      }).namedNode('propertyShape')
      expected.addOut(sh.path, path => path.addOut(sh.inversePath, schema.knows))
      expect(focusNode.dataset.toCanonical()).to.eq(expected.dataset.toCanonical())
    })
  })
})
