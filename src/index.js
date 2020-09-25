import ReactDOM from 'react-dom';
import React, {Component} from 'react'
import routes from './router.config.js';
import {Route , HashRouter,Switch} from 'react-router-dom';
import  './main.css';
ReactDOM.render(<HashRouter>
	<Switch>
		{
			routes.map(route=>(
				<Route exact={route.exact} key={route.path} path={route.path} component={route.component} />
			))
		}
	</Switch>
</HashRouter>,document.getElementById('app'));