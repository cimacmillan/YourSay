
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
      name:"",
      occupation:"",
      occupation_location:"",
      email:"",
      password:"",
      password_confirm:"",
      loading:false,
      show_message:false,
      message_text:"",
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getPhoto = this.getPhoto.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({
      show_message:false,
    })

    if (this.state.password != this.state.password_confirm) {
      this.setState({
        loading:false,
        show_message:true,
        message_text:"Password confirmation incorrect",
      })
      return;
    }

    this.setState({loading: true})

    let component = this;
    let username = this.state.email;
    let password = this.state.password;
    let form_data = {
      username: username,
      password: password,
      profile_image:this.state.imagePreviewUrl,
      name:this.state.name,
      occupation:this.state.occupation,
      occupation_location:this.state.occupation_location,
    }

    console.log(this.state)

    $.post(
      "/register", form_data,
      function(data, status){
        if(status == 'success' && data.status == 'ok'){
          $.post("/login", form_data, (data, status) => {
            if(status == 'success' && data.status == 'ok') {
              setToken(data.user.token);
              window.location.replace("/");
            } else {
              window.location.replace("/login");
            }
          })
        } else {

          component.setState({
            loading:false,
            show_message:true,
            message_text:data.error
          })
        }
      })

  }

  //https://stackoverflow.com/questions/39695275/react-js-handling-file-upload
  getPhoto(event){
    event.preventDefault();
    let reader = new FileReader();
    let file = event.target.files[0];
    let component = this;
    reader.onloadend = () => {
      component.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }
    reader.readAsDataURL(file);
  }

  render() {

    let imagePreview = null;
    if (this.state.imagePreviewUrl) {
      imagePreview = (<img className="candidate-image-register shadow_dark animated zoomIn" src={this.state.imagePreviewUrl} />);
    } else {
      imagePreview = (<div className="previewText">Please select a profile image</div>);
    }

    return <div class="d-flex flex-column animated fadeIn mt-5">

              <LogoFull/>

              <div class="container mt-5">
                <div class="row">

                  <div class="col-sm"></div>

                  <div class="col-sm text-center">

                      <form onSubmit={this.handleSubmit} encType="multipart/form-data">

                        <div class="form-group">

                          <div className="d-flex justify-content-center pb-5">
                            <div>{imagePreview}</div>
                          </div>

                          <input type="file" name="profile_image" onChange={this.getPhoto}/>
                        </div>

                        <div class="form-group">
                          <input name="name" type="text" class="form-control" placeholder="Name" value={this.state.name} onChange={this.handleChange}/>
                        </div>

                        <div class="form-group">
                          <input name="occupation" type="text" class="form-control" placeholder="Occupation" value={this.state.occupation} onChange={this.handleChange}/>
                        </div>

                        <div class="form-group">
                          <input name="occupation_location" type="text" class="form-control" placeholder="Place of Occupation" value={this.state.occupation_location} onChange={this.handleChange}/>
                        </div>

                        <div class="form-group">
                          <input name="email" type="email" class="form-control" placeholder="Email" value={this.state.email} onChange={this.handleChange}/>
                        </div>

                        <div class="form-group">
                          <input name="password" type="password" class="form-control" placeholder="Password" value={this.state.password} onChange={this.handleChange}/>
                        </div>

                        <div class="form-group">
                          <input name="password_confirm" type="password" class="form-control" placeholder="Password Confirmation" value={this.state.password_confirm} onChange={this.handleChange}/>
                        </div>

                        <LoginMessage show_message={this.state.show_message} message_text={this.state.message_text}/>
                        <LoginButton text="Register" loading={this.state.loading}/>

                        <small id="emailHelp" class="form-text text-muted">
                          Already have an account? <a href="login"> Sign in here. </a>
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
  document.getElementById('react_root_register')
);
