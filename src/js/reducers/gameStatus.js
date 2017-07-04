const initialState = {
  fetching: false,
  fetched: false,
  error: null
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
   case 'UPDATE_GAME_STATUS_FULFILLED': {
     return {...state, name:
             action.payload,
             fetching: false,
             fetched: true}
     console.log("Update Game Status has been changed.");
     break;
   }
   case 'UPDATE_GAME_STATUS_PENDING': {
     return {...state, fetching: true}
     break;
   }
   case 'UPDATE_GAME_STATUS_REJECTED': {
     state = {...state, fetching: false, name: action.payload}
     break;
   }
  }
  return state;
}

export default reducer;
