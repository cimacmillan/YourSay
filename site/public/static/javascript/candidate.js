

class Candidate extends React.Component {

  constructor(props){
    super(props);
  }

  render() {
    return <div class="pt-4 pl-3 pr-3 animated fadeIn">
              <div class="card" style={{background:"url(" + this.props.img_background + ")", "backgroundSize":"cover", "backgroundRepeat": "no-repeat", "backgroundPosition": "center"}}>
              <div class="media">

                <img class="align-self-center m-2 candidate-image shadow_dark" src={this.props.img_candidate}/>

                <div class="align-self-center media-body p-2">

                  <div class="card p-2 shadow_dark" style={{"backgroundColor":"rgba(255, 255, 255, 0.8)"}}>
                    <h5 class="card-title">{this.props.candidate_name} </h5>
                    <h6 class="card-subtitle mb-2 text-muted">{this.props.candidate_constituency}</h6>
                    <p class="card-text">{this.props.candidate_testimony}</p>
                  </div>

                </div>

              </div>
              </div>
            </div>
  }

}

class CandidatePage extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true
    }

    this.load_data();
  }


  load_data() {
    let component = this;

    $.get("/candidate_data", null, (data, status) => {

      component.setState({
        loading: false,
        candidates: data.candidates
      })
    });
  }

  render() {

    if (this.state.loading) {
      return  <div class="container-fluid pt-5">
                <div class="row justify-content-center">
                  <div id="login_button_loading" class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                </div>
              </div>
    }

    let candidate_element = this.state.candidates.map(
      (candidate) => {
        return <Candidate img_background={candidate.image_background}
                          img_candidate={candidate.image_profile}
                          candidate_name={candidate.full_name}
                          candidate_constituency={candidate.location}
                          candidate_testimony={candidate.testimonial}
                          />
      }
    )

    console.log(this.state.candidates)

    return <div>{candidate_element}</div>
  }


}


ReactDOM.render(
  <CandidatePage/>,
  document.getElementById('inject_candidate')
);
