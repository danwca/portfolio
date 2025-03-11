const initialState = {
    backgroundColor: '#ffffff', // Ĭ�ϱ�����ɫ
};

const uiColorReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_BACKGROUND_COLOR':
            return {
                ...state,
                backgroundColor: action.payload,
            };
        default:
            return state;
    }
};

export default uiColorReducer;