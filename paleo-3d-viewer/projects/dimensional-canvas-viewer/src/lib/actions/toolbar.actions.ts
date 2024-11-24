import { createAction } from '@ngrx/store';

export const openProjectPicker = createAction(
    '[Main-View] open-project-picker'
)

export const openFossilCropDialog = createAction(
    '[Main-View] open-fossil-crop-dialog'
)

export const openFileUploadDialog = createAction(
    '[Main-View] open-file-upload-dialoge'
)
