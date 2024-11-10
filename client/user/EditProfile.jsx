import React, { useState, useEffect } from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import { makeStyles } from "@material-ui/core/styles";
//import auth from '../lib/auth-helper.js'
import auth from "../lib/auth-helper";
import { read, update } from "./api-user.js";
import { Navigate } from "react-router-dom";
//import { useParams } from 'react-router-dom';
const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: 600,
    margin: "auto",
    textAlign: "center",
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2),
  },
  title: {
    margin: theme.spacing(2),
    color: theme.palette.protectedTitle,
  },
  error: {
    verticalAlign: "middle",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300,
  },
  submit: {
    margin: "auto",
    marginBottom: theme.spacing(2),
  },
  subheading: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle,
  },
}));
export default function EditProfile() {
  const classes = useStyles();
  //const { userId } = useParams();
  const [values, setValues] = useState({
    name: "",
    password: "",
    email: "",
    //open: false,
    seller: false,
    error: "",
    NavigateToProfile: false,
  });
  const jwt = auth.isAuthenticated();
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    read(
      {
        //userId: userId
        userId: jwt.user._id,
      },
      { t: jwt.token },
      signal
    ).then((data) => {
      if (data && data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setValues({
          ...values,
          name: data.name,
          email: data.email,
          seller: data.seller,
        });
      }
    });
    return function cleanup() {
      abortController.abort();
    };
    //}, [userId])
  }, [jwt.user._id]);
  const clickSubmit = () => {
    const user = {
      name: values.name || undefined,
      email: values.email || undefined,
      password: values.password || undefined,
      seller: values.seller || false,
    };
    update(
      {
        //userId: userId
        userId: jwt.user._id,
      },
      {
        t: jwt.token,
      },
      user
    ).then((data) => {
      if (data && data.error) {
        setValues({ ...values, error: data.error });
      } else {
        auth.updateUser(data, () => {
          setValues({ ...values, userId: data._id, NavigateToProfile: true });
        });
      }
    });
  };
  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };
  const handleCheck = (event, checked) => {
    setValues({ ...values, seller: checked });
  };
  if (values.NavigateToProfile) {
    return <Navigate to={"/user/" + values.userId} />;
  }
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" className={classes.title}>
          Edit Profile
        </Typography>
        <TextField
          id="name"
          label="Name"
          className={classes.textField}
          value={values.name}
          onChange={handleChange("name")}
          margin="normal"
        />
        <br />
        <TextField
          id="email"
          type="email"
          label="Email"
          className={classes.textField}
          value={values.email}
          onChange={handleChange("email")}
          margin="normal"
        />
        <br />
        <TextField
          id="password"
          type="password"
          label="Password"
          className={classes.textField}
          value={values.password}
          onChange={handleChange("password")}
          margin="normal"
        />
        <Typography variant="subtitle1" className={classes.subheading}>
          Seller Account
        </Typography>
        <FormControlLabel
          control={
            <Switch
              classes={{
                checked: classes.checked,
                bar: classes.bar,
              }}
              checked={values.seller}
              onChange={handleCheck}
            />
          }
          label={values.seller ? "Active" : "Inactive"}
        />
        <br />{" "}
        {values.error && (
          <Typography component="p" color="error">
            <Icon color="error" className={classes.error}>
              error
            </Icon>
            {values.error}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button
          color="primary"
          variant="contained"
          onClick={clickSubmit}
          className={classes.submit}
        >
          Submit
        </Button>
      </CardActions>
    </Card>
  );
}
