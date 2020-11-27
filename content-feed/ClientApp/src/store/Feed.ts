import { Action, Reducer } from 'redux';
import {AppThunkAction} from "./index";

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface FeedState {
    contentItems: ContentItemModel[];
    lastContentItemId: string;
    lastContentItemDate: Date;
    isLoading: boolean;
}

export interface ContentItemModel {
    contentItemId: string;
    link: string;
    type: string;
    date: Date;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

export interface AddNewContentItemAction { type: 'ADD_NEW_CONTENT_ITEM', link: string }

export interface ReceiveContentAction {
    type: 'RECEIVE_CONTENT';
    lastContentItemId: string;
    lastContentItemDate: Date;
    contentItems: ContentItemModel[];
}

export interface RequestContentAction {
    type: 'REQUEST_CONTENT';
    lastContentItemId: string;
    lastContentItemDate: Date;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
export type KnownAction = AddNewContentItemAction | ReceiveContentAction | RequestContentAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    addNewContentItem: () => ({ type: 'ADD_NEW_CONTENT_ITEM' } as AddNewContentItemAction),
    getContent: (lastContentItemId : string, lastContentItemDate : Date) : AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();
        if (appState 
            && appState.feed 
            && appState.feed.isLoading == false
            && (lastContentItemId !== appState.feed.lastContentItemId 
                    && lastContentItemId !== "" 
                    && appState.feed.lastContentItemId !== ""
                || appState.feed.lastContentItemId === "")) {
            fetch(`feed`)
                .then(response => response.json() as Promise<ContentItemModel[]>)
                .then(data => {
                    dispatch({type: 'RECEIVE_CONTENT', lastContentItemId: lastContentItemId, lastContentItemDate: new Date(), contentItems: data});
                });

            dispatch({type: 'REQUEST_CONTENT', lastContentItemId: lastContentItemId, lastContentItemDate: new Date()});
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<FeedState> = (state: FeedState | undefined, incomingAction: Action): FeedState => {
    if (state === undefined) {
        return { lastContentItemId: "", contentItems: [], lastContentItemDate: new Date(), isLoading: false};
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'RECEIVE_CONTENT':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.lastContentItemId === state.lastContentItemId) {
                let lastContentItemId = action.lastContentItemId;
                
                if (action.contentItems.length > 0)
                {
                    lastContentItemId = action.contentItems[action.contentItems.length-1].contentItemId;
                }
                
                return {
                    lastContentItemId: lastContentItemId,
                    contentItems: action.contentItems,
                    lastContentItemDate: action.lastContentItemDate,
                    isLoading: false
                };
            }
            break;
        case 'REQUEST_CONTENT':
            return {
                lastContentItemId: action.lastContentItemId,
                lastContentItemDate: action.lastContentItemDate,
                contentItems: state.contentItems,
                isLoading: true
            };
        default:
            return state;
    }

    return state;
};
