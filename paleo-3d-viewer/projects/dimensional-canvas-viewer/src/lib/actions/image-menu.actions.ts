import { createAction, props } from '@ngrx/store';
import { Fossil } from '../models/fossil.model';

export const startFossilDragging = createAction(
    '[Image-menu] start-fossil-dragging',
    props<{fossil: Fossil}>()
)