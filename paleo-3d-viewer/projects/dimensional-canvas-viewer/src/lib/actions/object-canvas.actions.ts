import { createAction, props } from '@ngrx/store';
import { Fossil } from '../models/fossil.model';

export const fossilAddedToCanvas = createAction(
    '[Object-Canvas] fossil-added-to-canvas',
    props<{fossil: Fossil}>()
)