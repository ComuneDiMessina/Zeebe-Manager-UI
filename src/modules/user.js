export const SET_USER = 'user/SET_USER'
export const UNSET_USER = 'user/UNSET_USER'
export const AUTH = 'user/AUTH'
export const AUTHORIZED = 'user/AUTHORIZED'
export const SET_PANEL = 'user/SET_PANEL'
export const SET_NAME = 'user/SET_NAME'
export const SET_SURNAME = 'user/SET_SURNAME'
export const SET_READER = 'user/SET_READER'
export const SET_EDITOR = 'user/SET_EDITOR'
export const SET_ADMIN = 'user/SET_ADMIN'

const initialStateUser = {
  username: null,
  name:null,
  surname:null,
  password: null,
  role:null,
  remember: false,
  isAdmin:false,
  isReader:false,
  isEditor:false,
  authorized:false,
  isAuthed: false,
  token:null,
  refresh_token:null,
  panel:false
}

export default (state = initialStateUser, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        username: action.payload.username,
        name:action.payload.name,
        surname:action.payload.surname,
        password: action.payload.password,
        remember: action.payload.remember,

        isReader: action.payload.isReader,
        isEditor: action.payload.isEditor,
        isAdmin: action.payload.isAdmin,
        token:action.payload.token,
        refresh_token:action.payload.refresh_token,
        authorized:action.payload.authorized,
        role:action.payload.role,
        panel:action.payload.panel
      }

    case AUTH:
      return {
        ...state,
        isAuthed: true
      }

      case AUTHORIZED:
      return {
        ...state,
        authorized: action.payload
      }

      case SET_PANEL:
      return {
        ...state,
        panel: action.payload
      }

      case SET_NAME:
      return {
        ...state,
        name: action.payload
      }

      case SET_SURNAME:
      return {
        ...state,
        surname: action.payload
      }


      case SET_READER:
        return {
          ...state,
          isReader: action.payload
        }

        case SET_EDITOR:
          return {
            ...state,
            isEditor: action.payload
          }

      case SET_ADMIN:
      return {
        ...state,
        isAdmin: action.payload
      }

    case UNSET_USER:
      return initialStateUser

    default:
      return state
  }
}

export const setUser = user => {
  return dispatch => {
    dispatch({
      type: SET_USER,
      payload: user
    })
  }
}

export const auth = () => {
  return dispatch => {
    dispatch({
      type: AUTH
    })
  }
}

export const authorized = authorized => {
  return dispatch => {
    dispatch({
      type: AUTHORIZED,
      payload: authorized
    })
  }
}

export const setPanel = panel => {
  return dispatch => {
    dispatch({
      type: SET_PANEL,
      payload: panel
    })
  }
}

export const setName = name => {
  return dispatch => {
    dispatch({
      type: SET_NAME,
      payload: name
    })
  }
}

export const setSurname = surname => {
  return dispatch => {
    dispatch({
      type: SET_SURNAME,
      payload: surname
    })
  }
}


export const setReader = isReader => {
  return dispatch => {
    dispatch({
      type: SET_READER,
      payload: isReader
    })
  }
}

export const setEditor = isEditor => {
  return dispatch => {
    dispatch({
      type: SET_EDITOR,
      payload: isEditor
    })
  }
}

export const setAdmin = isAdmin => {
  return dispatch => {
    dispatch({
      type: SET_ADMIN,
      payload: isAdmin
    })
  }
}


export const unSetUser = () => {
  return dispatch => {
    dispatch({
      type: UNSET_USER
    })
  }
}
