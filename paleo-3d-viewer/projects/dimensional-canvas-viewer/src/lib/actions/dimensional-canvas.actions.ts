import { createAction, props } from '@ngrx/store';
import { Fossil } from '../models/fossil.model';

export const fossilSelected = createAction(
    '[Main-View] fossil-selected',
    props<{fossil: Fossil | null}>()
)