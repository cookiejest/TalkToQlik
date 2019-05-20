import axios from 'axios';

const isValidToken = (rootURI, token, userId) => {
    const tokenQuery = '?access_token=' + token;
    return axios.get(`${rootURI}/api/users/${userId + tokenQuery}`).catch((err) => {
        console.log(err)
    });
};

const updateState = (instance, app, props, global) => {
	console.log("TCL: updateState -> instance", instance)
    return instance.backendApi.getProperties().then((state) => {
        props.forEach((prop) => state[prop.key] = prop.value);
        instance.backendApi.setProperties(state);
        // checks for is desktop version
        global.isPersonalMode((reply) => {
            const isPersonalMode = reply.qReturn;
            if (isPersonalMode) {
                console.log('Personal Mode!');
                app.doSave();
            }
        });
    });
};

export { isValidToken, updateState };