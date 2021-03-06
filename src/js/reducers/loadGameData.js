//Load Game Data Reducer
const initialState = {
  fetching: false,
  fetched: false,
  gameData: '',
  error: null
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
   case 'LOAD_GAME_DATA': {
       state.gameData = action.payload;

       return {...state}
       break;
   }
   case 'LOAD_BOXSCORE_AWAY': {
       state.boxScore_away = action.payload;

       return {...state}
       break;
   }
   case 'LOAD_BOXSCORE_HOME': {
       state.boxScore_home = action.payload;

       return {...state}
       break;
   }
   case 'LOAD_GAME_TAB_DATA': {
       state.gameTabData = action.payload;

       return {...state}
       break;
   }
  }
  return state;
}

export default reducer;
