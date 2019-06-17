
class BillEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            title: "",
            summary: "",
            type: 0,
            text_link: "",
            bulleted_list: "",
            date: ""
        }

        this.onChange = this.onChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        let date = new Date(this.state.date);

        let data = {
            title: this.state.title,
            summary: this.state.summary,
            type: this.state.type,
            text_link: this.state.text_link,
            bulleted_list: this.state.bulleted_list,
            date: date
        }

        $.post("/admin_bill", data, ((data, status) => {

            if(data == "success"){
                this.setState({
                    title: "Accepted",
                    summary: "",
                    type: 0,
                    text_link: "",
                    bulleted_list: "",
                    date: ""
                })
            } else {
                this.setState({
                    title: "Rejected",
                    summary: "",
                    type: 0,
                    text_link: "",
                    bulleted_list: "",
                    date: ""
                })
            }

        }).bind(this));
        
    }

    onChange(event) {
        this.setState(
            {[event.target.name]: event.target.value}
        )
    }

    render() {
        return <div>
                    <h1 class="d-flex justify-content-center"> Bill Submission </h1>

                    <div class="d-flex justify-content-center">
                        <input type="text" placeholder="Title"  name="title" onChange={this.onChange} value={this.state.title}/>
                    </div>

                    <div class="d-flex justify-content-center pt-2">
                        <input type="text" placeholder="Summary"  name="summary" onChange={this.onChange} value={this.state.summary}/>
                    </div>

                    <div class="d-flex justify-content-center pt-3"> 
                        <ul>
                            <li>0: Parliamentary Bill</li>
                            <li>1: Organisation Decision</li>
                        </ul>
                    </div>

                    <div class="d-flex justify-content-center">
                        <input type="number" placeholder="Bill Type"  name="type" onChange={this.onChange} value={this.state.type}/>
                    </div>

                    <div class="d-flex justify-content-center pt-2">
                        <input type="text" placeholder="Text Link"  name="text_link" onChange={this.onChange} value={this.state.text_link}/>
                    </div>

                    <div class="d-flex justify-content-center pt-2"> 
                        <textarea class="form-control rounded-0" name="bulleted_list" rows="10" onChange={this.onChange} value={this.state.bulleted_list} placeholder="Bulleted list seperated by line"></textarea>
                    </div>

                    <div class="d-flex justify-content-center pt-2"> 
                        <input type="date" name="date" onChange={this.onChange} value={this.state.date}/>
                    </div>

                    <div class="d-flex justify-content-center"> 
                        <form onSubmit={this.handleSubmit} encType="multipart/form-data">
                            <button id="submit_button" type="submit" class="btn btn-primary border rounded shadow">Submit Bill</button>
                        </form>
                    </div>

                </div>
    }

}

class AnnouncementEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            html: "<i> begin editting to see preview </i>"
        }

        this.onChange = this.onChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    onChange(event) {
        this.setState(
            {[event.target.name]: event.target.value}
        )
    }

    

    handleSubmit(event) {
        event.preventDefault();

        let data = {
            html: this.state.html
        }

        $.post("/admin_announcement", data, ((data, status) => {

            if(data == "success"){
                this.setState({
                    html: "<h1> Accepted </h1>"
                })
            } else {
                this.setState({
                    html: "<h1> Not Accepted </h1>"
                })
            }

        }).bind(this));

    }

    render() {
        return <div>
                <h1 class="d-flex justify-content-center"> Announcement Edit </h1>

                <div class="d-flex justify-content-center"> HTML Edit </div>

                <div class="d-flex justify-content-center"> 
                    <textarea class="form-control rounded-0" name="html" rows="10" onChange={this.onChange} value={this.state.html}></textarea>
                </div>

                <div class="d-flex justify-content-center"> 
                    Preview
                </div>

                <div class="d-flex justify-content-center"> 
                    <div dangerouslySetInnerHTML={{ __html: this.state.html}}/>
                </div>

                <div class="d-flex justify-content-center"> 
                    <form onSubmit={this.handleSubmit} encType="multipart/form-data">
                        <button id="submit_button" type="submit" class="btn btn-primary border rounded shadow">Submit Announcement</button>
                    </form>
                </div>

            </div>
    }

}

class CandidateEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            full_name: "",
            location: "",
            testimonial: "",
        }

        this.onChange = this.onChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getPhoto = this.getPhoto.bind(this);
    }

    onChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }

    handleSubmit(event) {
        event.preventDefault();

        let data = {
            full_name: this.state.full_name,
            location: this.state.location,
            testimonial: this.state.testimonial,
            image_profile: this.state.image_profile,
            image_background: this.state.image_background
        }

        $.post("/admin_candidate", data, ((data, status) => {

            if(data == "success"){
                this.setState({
                    full_name: "Accepted",
                    location: "Accepted",
                    testimonial: "Accepted",
                    image_profile: undefined,
                    image_background: undefined
                })
            } else {
                this.setState({
                    full_name: "Rejected",
                    location: "Rejected",
                    testimonial: "Rejected",
                    image_profile: undefined,
                    image_background: undefined
                })
            }

        }).bind(this));

        console.log(this.state);
    }

    //https://stackoverflow.com/questions/39695275/react-js-handling-file-upload
    getPhoto(event){
        event.preventDefault();
        let reader = new FileReader();
        let file = event.target.files[0];
        let component = this;
        let name = event.target.name;
        reader.onloadend = () => {
            component.setState({
                [name]: reader.result
            });
        }

        reader.readAsDataURL(file);
    }

    render() {

        let imagePreview = null;
        if (this.state.image_profile) {
          imagePreview = (<img className="candidate-image shadow_dark animated zoomIn" src={this.state.image_profile} />);
        } else {
          imagePreview = (<div className="previewText">Please select a profile image</div>);
        }

        let backdropImage = null;
        if (this.state.image_background) {
            backdropImage = (<img className="shadow_dark animated zoomIn" style={{"max-width":"750px", "max-height":"250px", "position": "center"}} src={this.state.image_background} />);
        } else {
            backdropImage = (<div className="previewText">Please select a backdrop image</div>);
        }

        return <div>
                    <h1 class="d-flex justify-content-center"> Candidate Submission </h1>

                    <div class="d-flex justify-content-center">
                        <input type="text" placeholder="Full Name"  name="full_name" onChange={this.onChange} value={this.state.full_name}/>
                    </div>

                    <div class="d-flex justify-content-center pt-2">
                        <input type="text" placeholder="Location"  name="location" onChange={this.onChange} value={this.state.location}/>
                    </div>

                    <div class="d-flex justify-content-center pt-2"> 
                        <textarea class="form-control rounded-0" name="testimonial" rows="10" onChange={this.onChange} value={this.state.testimonial} placeholder="Testimonial"></textarea>
                    </div>

            
                    <div class="d-flex justify-content-center pt-2"> 
                        {imagePreview}
                    </div>
                    <div class="d-flex justify-content-center pt-2"> 
                        <input type="file" name="image_profile" onChange={this.getPhoto}/>
                    </div>

                    <div class="d-flex justify-content-center pt-2"> 
                        {backdropImage}
                    </div>
                    <div class="d-flex justify-content-center pt-2"> 
                        <input type="file" name="image_background" onChange={this.getPhoto}/>
                    </div>

                    <div class="d-flex justify-content-center"> 
                        <form onSubmit={this.handleSubmit} encType="multipart/form-data">
                            <button id="submit_button" type="submit" class="btn btn-primary border rounded shadow">Submit Bill</button>
                        </form>
                    </div>

                </div>
    }

}

class Admin extends React.Component {

    render() {

        return <div class="row pt-5  justify-content-center">

            <div class="col-md-6 d-flex justify-content-center"><BillEdit/></div>
            <div class="col-md-6 d-flex justify-content-center"><AnnouncementEdit/></div>
            <div class="col-md-6 d-flex justify-content-center"><CandidateEdit/></div>
            
            </div>

    }

}


ReactDOM.render(
    <Admin/>,
    document.getElementById('admin_main_content')
  );
