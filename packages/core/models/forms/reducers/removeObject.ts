import type { PropertyShape } from '@rdfine/shacl'
import { objectStateProducer } from '../objectStateProducer'
import { BaseParams, formStateReducer } from '../../index'
import type { FocusNode } from '../../../index'
import { canAddObject, canRemoveObject } from '../lib/property'
import type { PropertyObjectState } from '../index'

export interface RemoveObjectParams extends BaseParams {
  focusNode: FocusNode
  property: PropertyShape
  object: PropertyObjectState
}

export const removeObject = formStateReducer(objectStateProducer<RemoveObjectParams>((draft, { property, object }, propertyState) => {
  const objects = propertyState.objects.filter(o => o.key !== object.key)

  propertyState.objects = objects
  propertyState.canRemove = canRemoveObject(property, objects.length)
  propertyState.canAdd = canAddObject(property, objects.length)
}))
