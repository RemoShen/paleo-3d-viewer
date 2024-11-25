import { createReducer, on } from "@ngrx/store";

// import * as _ from 'lodash';

// model
import { Project } from "../models/project.model";
import { fossilSelected, projectDataLoaded } from "../actions/main-view.actions";
import { startFossilDragging } from "../actions/image-menu.actions";
import { Fossil } from "../models/fossil.model";
import { fossilAddedToCanvas } from "../actions/object-canvas.actions";
import { createImmerReducer } from 'ngrx-immer/store';
import { openEditScansDialog, openMarkFossilsDialog } from "../actions/scans.actions";
import { openEditFossilDialog } from "../actions/catalog.actions";
import { openLensDialog, toggle3D } from "../actions/image-canvas.actions";



export interface IMainViewState {

    availableProjects: Project[],
    loadedProject: Project | null,
    projectFossils: { [fossilID: string]: Fossil },

    draggingFossil: Fossil | null;
    selectedFossil: Fossil | null;
    selectedScan: string | null;
    selectedFossils: Fossil[] | null;
    mode: string,

    canvasFossils: Fossil[];
}


const mainViewState: IMainViewState = {
    
    availableProjects: [],
    loadedProject: null,
    projectFossils: {},

    draggingFossil: null,
    selectedFossil: null,
    selectedScan: null,
    selectedFossils: [],
    mode: '2d',

    canvasFossils: [],

}

export const mainViewReducer = createImmerReducer(

    mainViewState,

    on( projectDataLoaded, ( state: IMainViewState, action: {project: Project, type: string} ) => {
        
        const currentState: IMainViewState = { ...state};

        const projectFossils: { [fossilID: string]: Fossil } = action.project.fossils.reduce( 
            (   indexedFossils: { [fossilID: string]: Fossil }, 
                currentFossil: Fossil ) => {
                    indexedFossils[currentFossil.fossil_id] = currentFossil;
                    return indexedFossils;
            }, {} );
        
        // setting new state
        currentState.loadedProject = action.project; 
        currentState.projectFossils = projectFossils;

        console.log(currentState.projectFossils)

        return currentState;

    }),

    on( startFossilDragging, ( state: IMainViewState, action: {fossil: Fossil, type: string} ) => {
        
        const currentState: IMainViewState = { ...state };

        currentState.draggingFossil = currentState.projectFossils[action.fossil.fossil_id];
        return currentState;

    }),

    on( fossilAddedToCanvas, ( state: IMainViewState, action: {fossil: Fossil, type: string} ) => {

        // const currentState: IMainViewState = { ...state };

        // , canvasFossils: _.clone(state.canvasFossils)

        state.draggingFossil = null;
        state.canvasFossils.push( state.projectFossils[action.fossil.fossil_id] );

        
        return state;

    }),

    on( fossilSelected, ( state: IMainViewState, action: {fossil: Fossil | null, type: string} ) => {
        const currentState: IMainViewState = { ...state };

        if( action.fossil ){
            currentState.selectedFossil = currentState.projectFossils[action.fossil.fossil_id];
            return currentState;
        }

        currentState.selectedFossil = null;
        return currentState;

    }),

    on( openMarkFossilsDialog, ( state: IMainViewState, action: any ) => {
        const currentState: IMainViewState = { ...state };
        currentState.selectedScan = action.scan_id;
        return currentState;

    }),

    on( openEditScansDialog, ( state: IMainViewState, action: any ) => {
        const currentState: IMainViewState = { ...state };
        currentState.selectedScan = action.scan_id;
        return currentState;
    }),

    on( openEditFossilDialog, ( state: IMainViewState, action: any ) => {
        const currentState: IMainViewState = { ...state };
        currentState.selectedFossil = action.fossil;
        return currentState;
    }),

    on( openLensDialog, ( state: IMainViewState, action: any ) => {
        const currentState: IMainViewState = { ...state };
        currentState.selectedFossils = action.fossils;
        return currentState;
    }),

    on( toggle3D, ( state: IMainViewState, action: any ) => {
        const currentState: IMainViewState = { ...state };
        currentState.mode = action.mode;
        return currentState;
    }),
    )