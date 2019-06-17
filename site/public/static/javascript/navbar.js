
class Navbar extends React.Component {

  constructor(props){
    super(props);
    this.state={
      search:""
    }
    this.handleChange = this.handleChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  onSearchSubmit(event) {
    event.preventDefault();
    console.log("On search submit: " + this.state.search);
    window.location.replace("/home?search=" + encodeURIComponent(this.state.search));
  }

  render() {
    return  <nav id="home_navbar" class="navbar fixed-top navbar-expand-lg navbar-light animated slideInDown">
                <div class="navbar-brand">
                  <object data="/svg/logo_small_optimised.svg" type="image/svg+xml" width="40" height="32"/>
                </div>

                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                  <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarSupportedContent">

                  <ul class="navbar-nav mr-auto">

                    <li class="nav-item">
                      <a class="nav-link text-white" href="/home">Home<span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link text-white" href="/about">About</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link text-white" href="/announcements">Announcements</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link text-white" href="/candidate">Candidates</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link text-white" href="/home?finished=true">Finished Votes</a>
                    </li>
                    <li class="nav-item dropdown">
                      <a class="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Account
                      </a>
                      <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <a class="dropdown-item" onClick={logout}>Log out</a>
                      </div>
                    </li>

                  </ul>

                  <form class="form-inline my-2 my-lg-0" onSubmit={this.onSearchSubmit}>
                    <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" value={this.state.search} name="search" onChange={this.handleChange}/>
                    <button id="home_search_button"class="btn my-2 my-sm-0 text-white" type="submit">Search</button>
                  </form>

                </div>
                </nav>
  }
}

ReactDOM.render(
  <Navbar/>,
  document.getElementById('inject_navbar')
);
