
class LogoFull extends React.Component {
  render() {
      return  <div class="row pt-5 justify-content-center">
              <object data="/svg/logo_full_optimised.svg" type="image/svg+xml" class="w-50 h-50"> </object>
              </div>

  }
}

class LoginButton extends React.Component {
  render() {

    if(this.props.loading){
      return  <div id="login_button_loading" class="spinner-border" role="status">
              <span class="sr-only">Loading...</span>
              </div>
    }

    return <button id="login_button" type="submit" class="btn btn-primary border rounded shadow">{this.props.text}</button>
  }
}

class LoginMessage extends React.Component {
  render() {
    if (this.props.show_message == true) {
      return <div class="alert alert-danger" role="alert">{this.props.message_text}</div>
    }
    return <div/>
  }
}


class LoginForm extends React.Component {

  constructor(props) {
    super(props)

    this.state={
      email:"",
      password:"",
      loading:false,
      show_message:false,
      message_text:"",
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({loading: true})

    console.log("Logging in")

    console.log(this.state.email);
    console.log(this.state.password);

    let component = this;
    let username = this.state.email;
    let password = this.state.password;
    let data = {
      username: username,
      password: password
    }

    $.post("/login", data, (data, status) => {
      console.log(data);
      console.log(status);
      if(status == 'success' && data.status == 'ok') {
        setToken(data.user.token);
        window.location.replace("/");
      } else {
        component.setState({
          loading:false,
          show_message:true,
          message_text:"could not log in",
        })
      }
    })
  }

  render() {
    return <div class="d-flex flex-column animated fadeIn mt-5">

              <LogoFull/>

              <div class="container mt-5">
                <div class="row">

                  <div class="col-sm"></div>

                  <div class="col-sm text-center">

                      <form onSubmit={this.handleSubmit}>

                        <div class="form-group">
                          <input name="email" type="email" class="form-control" placeholder="Email" value={this.state.email} onChange={this.handleChange}/>
                        </div>

                        <div class="form-group">
                          <input name="password" type="password" class="form-control" placeholder="Password" value={this.state.password} onChange={this.handleChange}/>
                        </div>

                        <LoginMessage show_message={this.state.show_message} message_text={this.state.message_text}/>
                        <LoginButton text="Sign in" loading={this.state.loading}/>

                        <small id="emailHelp" class="form-text text-muted">
                          New to the site? <a href="register"> Register here </a>
                        </small>
                      </form>

                  </div>

                  <div class="col-sm"></div>

                </div>
              </div>

            </div>
  }
}

ReactDOM.render(
  <LoginForm/>,
  document.getElementById('react_root_login')
);
