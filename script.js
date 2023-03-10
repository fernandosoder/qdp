/* global hive_keychain */

localStorage.hiveNode === undefined ? localStorage.hiveNode = "https://api.hive.blog" : localStorage.hiveNode;
localStorage.target === undefined ? localStorage.target = "" : localStorage.target;
localStorage.username === undefined ? localStorage.username = "" : localStorage.username;
const rootUrl = "https://qdp.hivetasks.com/";
const publicIPFS = "https://ipfs.io/ipfs/";
const getCssString = (name) => {
    let val = getComputedStyle(document.documentElement).getPropertyValue(name);
    return val.substring(1, val.length - 1);
};
var loaded = true;
var idrequest = 0;
var postsPerRequest = 5;
var reward_fund = null;
var median_price = null;
var profiles = {};

const getProfile = (name, callback) => {
    if (profiles[name] !== undefined) {
        callback(profiles[name]);
        return;
    }
    let req = new XMLHttpRequest();
    req.addEventListener("load", (res) => {
        profiles[name] = JSON.parse(res.target.response)["result"];
        callback(JSON.parse(res.target.response)["result"]);
    });
    req.open("POST", localStorage.hiveNode);
    request = {
        "id": idrequest++,
        "jsonrpc": "2.0",
        "method": "bridge.get_profile",
        "params": {
            "account": name,
            "observer": localStorage.username
        }
    };
    req.send(JSON.stringify(request));
};



setInterval(() => {
    postsPerRequest = 5;
    document.querySelectorAll("section").forEach((post) => {
        if (checkVisible(post)) {
            updatePostData(post.getAttribute("author"), post.getAttribute("permlink"), 500);
        }
    });
}, 10000);
window.onload = () => {
    {
        let req = new XMLHttpRequest();
        req.addEventListener("load", (res) => {
            reward_fund = (JSON.parse(res.target.response).result);
            pricesLoaded();
        });
        req.open("POST", localStorage.hiveNode);
        let request = {
            "id": idrequest++,
            "jsonrpc": "2.0",
            "method": "condenser_api.get_reward_fund",
            "params": ["post"]
        };
        req.send(JSON.stringify(request));
    }
    {
        let req = new XMLHttpRequest();
        req.addEventListener("load", (res) => {
            median_price = (JSON.parse(res.target.response).result);
            pricesLoaded();
        });
        req.open("POST", localStorage.hiveNode);
        let request = {
            "id": idrequest++,
            "jsonrpc": "2.0",
            "method": "get_current_median_history_price"
        };
        req.send(JSON.stringify(request));
    }
    getTopTags();
};

var getDiscussion = (post, callback) => {
    let req = new XMLHttpRequest();
    req.addEventListener("load", callback);
    req.open("POST", localStorage.hiveNode);
    let request = {
        "id": idrequest++,
        "jsonrpc": "2.0",
        "method": "bridge.get_discussion",
        "params": {
            "author": post.getAttribute("author"),
            "permlink": post.getAttribute("permlink"),
            "observer": localStorage.username
        }
    };
    req.send(JSON.stringify(request));
};

var pricesLoaded = () => {
    if (reward_fund === null || median_price === null)
        return;
    document.querySelector(".☰").onclick = (evt) => {
        document.body.classList.toggle("sidemenu");
    };
    document.querySelector(".userprofile .loggedoff").onclick = (evt) => {
        logar(prompt("Inform your username for Keychain login.", localStorage.username));
    };
    let callLogar = () => {
        try {
            logar(localStorage.username);
        } catch (e) {
            console.log(e);
            setTimeout(callLogar, 100);
        }
    };
    callLogar();
    if (typeof document.body.attributes['upload'] !== "undefined") {
        createUploadWindow();
        return;
    }
    if (typeof document.body.attributes['tag'] !== "undefined") {

    }
    if (typeof document.body.attributes['author'] !== "undefined") {
        if (typeof document.body.attributes['permlink'] !== "undefined") {
            let req = new XMLHttpRequest();
            req.addEventListener("load", onLoadedPost);
            req.open("POST", localStorage.hiveNode);
            request = {
                "id": idrequest++,
                "jsonrpc": "2.0",
                "method": "bridge.get_post",
                "params": {
                    "author": document.body.attributes['author'].value,
                    "permlink": document.body.attributes['permlink'].value,
                    "observer": localStorage.username
                }
            };
            req.send(JSON.stringify(request));
            return;
        }
//        let req = new XMLHttpRequest();
//        req.addEventListener("load", onLoadedPosts);
//        req.open("POST", localStorage.hiveNode);
//        request = {
//            /***
//             * TODO: filtrar postagens por autor aqui
//             */
//            "id": idrequest++,
//            "jsonrpc": "2.0",
//            "method": "bridge.get_account_posts",
//            "params": {
//                "tag": "hive-179234",
//                "sort": "created",
//                "limit": postsPerRequest,
//                "start_author": null,
//                "start_permlink": null,
//                "observer": localStorage.username
//            }
//        };
//        req.send(JSON.stringify(request));
//        return;
    }

    let req = new XMLHttpRequest();
    req.addEventListener("load", onLoadedPosts);
    req.open("POST", localStorage.hiveNode);
    request = {
        "id": idrequest++,
        "jsonrpc": "2.0",
        "method": "bridge.get_ranked_posts",
        "params": {
            "tag": "hive-179234",
            "sort": "created",
            "limit": postsPerRequest,
            "start_author": null,
            "start_permlink": null,
            "observer": localStorage.username
        }
    };
    req.send(JSON.stringify(request));
};

var loadPost = (post, open = false) => {
//    console.log(post);
    if (post.community !== "hive-179234")
        return;
    let section = document.createElement("section");
    section.setAttribute("author", post.author);
    section.setAttribute("permlink", post.permlink);
    let isValid = true;
    if (typeof document.body.attributes['tag'] !== "undefined") {
        isValid = (post.json_metadata.tags.indexOf(document.body.attributes['tag'].value) > -1);
    } else if (typeof document.body.attributes['author'] !== "undefined") {
        isValid = section.getAttribute("author") === document.body.attributes['author'].value;
    }
    if (isValid && !(post.json_metadata.image === undefined && post.json_metadata.video === undefined)) {
        let section_media = document.createElement("div");
        section_media.classList.add("section_media");
        if (post.json_metadata.image.length > 0) {
            let image = document.createElement("img");
            image.onclick = imageFullScreen;
            image.src = publicIPFS + post.json_metadata.image[0].split("ipfs/")[1];
            image.title = publicIPFS + post.json_metadata.image[0].split("ipfs/")[1];
            let qtd = document.getElementById("posts_container").children.length;
            setTimeout(() => {
                if (!image.complete || !image.naturalWidth)
                {
                    let image2 = document.createElement("img");
                    image2.src = post.json_metadata.image[0];
                    image2.title = post.json_metadata.image[0];
                    image.style.display = "none";
                    image.parentElement.appendChild(image2);
                }
            }, qtd > 4 ? 5000 : (qtd + 1) * 1000);
            section_media.appendChild(image);
        } else
        if (post.json_metadata.video.length > 0) {
            let video = document.createElement("video");
//            let source_1 = document.createElement("source");
//            let source_2 = document.createElement("source");
            video.src = publicIPFS + post.json_metadata.video[0].split("ipfs/")[1];
//            source_1.src = "https://ipfs.io/ipfs/" + post.json_metadata.video[0].split("ipfs/")[1];
//            source_2.src = post.json_metadata.video[0];
//            video.appendChild(source_1);
//            video.appendChild(source_2);

            video.setAttribute("controls", "");
            video.setAttribute("loop", "");
            video.setAttribute("mute", "");
            setTimeout(() => {
                if (video.readyState < 3)
                {
                    video.src = post.json_metadata.video[0];
                }
            }, 3000);
            section_media.appendChild(video);
        } else {
            let parser = new DOMParser();
            let doc = parser.parseFromString(post.body, "text/html");
            if (doc.querySelector(".media") !== null)
                section_media.append(doc.querySelector(".media"));
        }

        let section_title_container = document.createElement("header");
        let section_title = document.createElement("h2");

        section_title_container.classList.add("section_header");
        section_title_container.appendChild(section_title);


        let section_author = document.createElement("a");
        section_author.innerHTML = "@" + post.author;
        section_author.href = rootUrl + "@" + post.author;
        section_author.classList.add("section_author");
        section_title_container.appendChild(section_author);


        let section_body = document.createElement("div");
        let section_openclose = document.createElement("a");
        let section_footer = document.createElement("footer");
        let title_a = document.createElement("a");

        title_a.target = localStorage.target;

        section_openclose.classList.add("section_openclose");
        section_openclose.onclick = (evt) => {
            let thisSection = evt.srcElement.parentNode;
            thisSection.classList.toggle("open");
        };

        title_a.innerHTML = post.title;
        title_a.href = rootUrl + "@" + post.author + "/" + post.permlink;



        let upvote = document.createElement("button");
        let downvote = document.createElement("button");

        upvote.classList.add("upvote");
        downvote.classList.add("downvote");

        let upvoteContent = document.createElement('div');
        upvoteContent.classList.add('content');
        let downvoteContent = document.createElement('div');
        downvoteContent.classList.add('content');

        let uc = document.createElement("output");
        let dc = document.createElement("output");

        uc.classList.add("votecounter");
        dc.classList.add("votecounter");

        upvoteContent.append(uc);
        upvoteContent.append(document.createElement("output"));
        upvote.append(upvoteContent);

        downvoteContent.append(dc);
        downvoteContent.append(document.createElement("output"));
        downvote.append(downvoteContent);



        let payout = post.is_paidout ? post.author_payout_value.split(" ")[0] : post.max_accepted_payout.split(" ")[0] < post.pending_payout_value.split(" ")[0] ? (post.max_accepted_payout.split(" ")[0] / 2).toFixed(3) : (post.pending_payout_value.split(" ")[0] / 2).toFixed(3);
        let upvotes = 0;
        let downvotes = 0;
        let upower = 0;
        let dpower = 0;
        let myvote = 0;

        post.active_votes.forEach((item, index) => {
            if (item.rshares > 0) {
                upvotes++;
                upower += item.rshares;
            }
            if (item.rshares < 0) {
                downvotes++;
                dpower += (item.rshares * -1);
            }
            if (item.voter === localStorage.username)
                myvote = item.rshares;
        });


        upvote.onclick = (evt) => {
            window.hive_keychain.requestHandshake(() => {
                vote = myvote > 0 ? 0 : 10000;
                window.hive_keychain.requestVote(localStorage.username, post.permlink, post.author, vote, (response) => {
                    if (response.success) {
                        document.querySelector("[author=" + post.author + "][permlink=" + post.permlink + "] button.upvote")
                                .classList.toggle("loading", true);
                        updatePostData(post.author, post.permlink);
                    }
                });
            });
        };
        downvote.onclick = (evt) => {
            window.hive_keychain.requestHandshake(() => {
                vote = myvote < 0 ? 0 : -10000;
                window.hive_keychain.requestVote(localStorage.username, post.permlink, post.author, vote, (response) => {
                    if (response.success) {
                        document.querySelector("[author=" + post.author + "][permlink=" + post.permlink + "] button.downvote")
                                .classList.toggle("loading", true);
                        updatePostData(post.author, post.permlink);
                    }
                });
            });
        };
        upvote.classList.toggle("myvote", myvote > 0);
        downvote.classList.toggle("myvote", myvote < 0);

        upvote.querySelector("output:first-child").innerHTML = upvotes;
        upvote.querySelector("output:last-child").innerHTML = "$ " + (upower / reward_fund.recent_claims * reward_fund.reward_balance.split(" ")[0] * median_price.base.split(" ")[0] * 0.45).toFixed(3);
        downvote.querySelector("output:first-child").innerHTML = downvotes;
        downvote.querySelector("output:last-child").innerHTML = "$ " + (dpower / reward_fund.recent_claims * reward_fund.reward_balance.split(" ")[0] * median_price.base.split(" ")[0] * 0.45).toFixed(3);


        let tags = document.createElement("div");
        tags.classList.add("tags_container");
        post.json_metadata.tags.forEach((tag) => {
            if (tag === post.community)
                return;
            let tag_container = document.createElement("span");
            let tag_a = document.createElement("a");
            tag_container.classList.add("tag_container");
            tag_a.append(tag);
            tag_a.href = rootUrl + "tag/" + tag;
            tag_container.append(tag_a);
            tags.appendChild(tag_container);
        });

        let voteBlock = document.createElement('div');
        voteBlock.classList.add('vote_block');
        voteBlock.appendChild(upvote);
        voteBlock.appendChild(downvote);

        section_footer.appendChild(tags);
        section_footer.appendChild(voteBlock);

        section_title.appendChild(title_a);
        section_title.classList.add("section_title");

        let parser = new DOMParser();
        let doc = parser.parseFromString(post.body, "text/html");
//        console.log(doc.querySelector(".comment"));
        if (doc.querySelector(".comment") === null)
            section_body.innerHTML = post.body.replace(/<img[^>]*>/g, "");
        else
        {
            doc.querySelector(".comment").innerHTML = doc.querySelector(".comment").innerHTML.replaceAll("\n", "<br/>");
            section_body.append(doc.querySelector(".comment"));
        }


        let ex_rpcontainer = document.createElement("div");
        let replies_div = document.createElement("div");
        let payout_div = document.createElement("div");
        let replies = document.createElement("output");
        let replies_a = document.createElement("a");
        let total_payout = document.createElement("output");
        let payout_at = document.createElement("output");
        let rpcontainer = document.createElement("div");

        let replies_container_div = document.createElement("div");

        replies_container_div.classList.add("replies_container_div");
        ex_rpcontainer.append(rpcontainer);
        replies.classList.add("replies");
        total_payout.classList.add("total_payout");
        payout_at.classList.add("payout_at");
//        payout_at.style.display = "none";
        ex_rpcontainer.classList.add("rpcontainer");
        replies_a.append(replies);
        replies_a.href = "https://hive.blog/@" + post.author + "/" + post.permlink;
        replies_a.target = "_blank";
        replies_div.append(replies_a);
        payout_div.append(total_payout);
        if (!post.is_paidout)
            payout_div.append(payout_at);


        rpcontainer.append(replies_div);

        rpcontainer.append(payout_div);
        section_footer.append(ex_rpcontainer);
        section_footer.append(replies_container_div);

        console.log(post.children);
        replies.innerHTML = post.children;
        total_payout.innerHTML = (payout + "").slice(0, -1) + "<span>" + (payout + "").charAt((payout + "").length - 1) + "</span>";
        let date = new Date(post.payout_at + ".000+0000");
        let now = new Date();
        payout_at.setAttribute("epoch", date.valueOf() / 1000);
        payout_at.innerHTML = date.toLocaleString();
        total_payout.classList.toggle("paid", post.is_paidout);
        section_body.classList.add("section_body");
        section_footer.classList.add("section_footer");
        section.appendChild(section_title_container);

        section.appendChild(section_media);
        if (section_body.innerText.length > 0 && !open)
            section.appendChild(section_openclose);
        else
            section.classList.toggle("open");
//        console.log(section_body.innerText.length);
        section.appendChild(section_body);
        section.appendChild(section_footer);
    }
    document.getElementById("posts_container").append(section);
    if (post.permlink === 'qdp-2023-01-10-13-43') {
        let section = document.createElement("section");
        let h1 = document.createElement("h1");
        h1.append(getCssString("--feed-feedisover"));
        section.classList.add("feedisover");
        section.append(h1);
        document.getElementById("posts_container").append(section);
    }
    if (open)
        getDiscussion(section, (res) => {
            let lista = JSON.parse(res.target.response).result;
            Object.values(lista).forEach(item => {
                if (item.depth === 0)
                    return;
                let comment_section = document.createElement("section");
                let author_link = document.createElement("a");
                let author = document.createElement("figure");
                let author_name = document.createElement("figcaption");
                let author_img = document.createElement("img");
                let text = document.createElement("div");
                author.append(author_img);
                author.append(author_name);
                author_link.append(author);
                comment_section.append(author_link);
                comment_section.append(text);


                author_name.append(item.author);
                getProfile(item.author, (res) => {
                    author_img.src = res["metadata"]["profile"]["profile_image"];
                });

                text.append(item.body);
                console.log(item);
                section.querySelector(".replies_container_div").append(comment_section);
            });
        });
};
function checkVisible(elm) {
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}
var updatePostData = (author, permlink, timeout = 5000) => {
    setTimeout(() => {
        let req = new XMLHttpRequest();
        req.addEventListener("load", (res) => {
            let post_element = document.querySelector("[author=" + author + "][permlink=" + permlink + "] ");
            let post = JSON.parse(res.target.response)["result"];
//            console.log(post);
            try {
                let payout = post.is_paidout ? post.author_payout_value.split(" ")[0] : post.max_accepted_payout.split(" ")[0] < post.pending_payout_value.split(" ")[0] ? (post.max_accepted_payout.split(" ")[0] / 2).toFixed(3) : (post.pending_payout_value.split(" ")[0] / 2).toFixed(3);
            } catch (err) {

            }
            let upvotes = 0;
            let downvotes = 0;
            let upower = 0;
            let dpower = 0;
            let myvote = 0;
            let upvote = document.querySelector("[author=" + post.author + "][permlink=" + post.permlink + "] button.upvote");
            let downvote = document.querySelector("[author=" + post.author + "][permlink=" + post.permlink + "] button.downvote");

            post.active_votes.forEach((item, index) => {
                if (item.rshares > 0) {
                    upvotes++;
                    upower += item.rshares;
                }
                if (item.rshares < 0) {
                    downvotes++;
                    dpower += (item.rshares * -1);
                }
                if (item.voter === localStorage.username)
                    myvote = item.rshares;
            });
//            console.log(upvotes);
//            console.log(downvotes);
            upvote.classList.toggle("myvote", myvote > 0);
            downvote.classList.toggle("myvote", myvote < 0);
            let spanvotes = document.createElement("span");
            spanvotes.classList.add("span_votes");
            upvote.querySelector("output:first-child").innerHTML = upvotes;
//            upvote.querySelector("output:first-child").append(spanvotes);
            upvote.querySelector("output:last-child").innerHTML = "$ " + (upower / reward_fund.recent_claims * reward_fund.reward_balance.split(" ")[0] * median_price.base.split(" ")[0] * 0.45).toFixed(3);
            downvote.querySelector("output:first-child").innerHTML = downvotes;
            downvote.querySelector("output:last-child").innerHTML = "$ " + (dpower / reward_fund.recent_claims * reward_fund.reward_balance.split(" ")[0] * median_price.base.split(" ")[0] * 0.45).toFixed(3);

            upvote.classList.toggle("loading", false);
            downvote.classList.toggle("loading", false);
            post_element.querySelector(".rpcontainer .replies").innerHTML = post.children;
            post_element.querySelector(".rpcontainer .total_payout").innerHTML = payout;
        });
        req.open("POST", localStorage.hiveNode);
        request = {
            "id": idrequest++,
            "jsonrpc": "2.0",
            "method": "bridge.get_post",
            "params": {
                "author": author,
                "permlink": permlink,
                "observer": localStorage.username
            }
        };
        req.send(JSON.stringify(request));
    }, timeout);
};

var onLoadedPosts = (res) => {
    let posts = JSON.parse(res.target.response)["result"];
    posts.forEach((post) => {
        loadPost(post, false);
    });
    loaded = true;
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100 &&
            document.querySelectorAll("[permlink='qdp-2023-01-10-13-43']").length === 0)
        setTimeout(() => {
            window.onscroll();
        }, 500);

};

var imageFullScreen = (evt) => {
    let thisSection = evt.srcElement.src;
    let bigimage = document.createElement("div");
    let image = document.createElement("img");
    image.src = thisSection;
    bigimage.appendChild(image);
    bigimage.classList.add("bigimage");
    bigimage.onclick = (evt) => {
        document.querySelector(".bigimage").remove();
    };
    document.body.appendChild(bigimage);
};

var onLoadedPost = (res) => {
    let post = JSON.parse(res.target.response)["result"];
    loadPost(post, true);
};

window.onscroll = function () {
    if (typeof document.body.attributes['upload'] !== "undefined")
        return;
    if (typeof document.body.attributes['permlink'] !== "undefined")
        return;
    if (document.querySelectorAll("#posts_container .feedisover").length > 0)
        return;
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100) {
        if (!loaded)
            return;
        loaded = false;
        let last = document.querySelector("#posts_container").lastChild;
        let req = new XMLHttpRequest();
        req.addEventListener("load", onLoadedPosts);
        req.open("POST", localStorage.hiveNode);
        request = {
            "id": idrequest++,
            "jsonrpc": "2.0",
            "method": "bridge.get_ranked_posts",
            "params": {
                "tag": "hive-179234",
                "sort": "created",
                "limit": postsPerRequest,
                "start_author": last.getAttribute("author"),
                "start_permlink": last.getAttribute("permlink"),
                "observer": localStorage.username
            }
        };
        req.send(JSON.stringify(request));
        postsPerRequest = 50;
    }
};

var createUploadWindow = () => {
    document.getElementById("posts_container").innerHTML = "";

    let upload_section = document.createElement("section");
    upload_section.classList.add("upload_section");

    let titulo = document.createElement("textarea");
    titulo.classList.add("titulo_textarea");
    titulo.placeholder = getCssString("--upload-title-post");
    upload_section.appendChild(titulo);

    let uploadfile = document.createElement("input");
    uploadfile.classList.add("uploadfile");
    uploadfile.setAttribute("type", "file");
    upload_section.appendChild(uploadfile);
    uploadfile.onchange = (fileevent) => {
        prepareFile(document.querySelector("input.uploadfile").files[0]);
    };

    let media = document.createElement("div");
    media.classList.add("mediaobject");
    media.onclick = (evt) => {
        if (evt.srcElement.children.length > 0) {
            evt.srcElement.innerHTML = "";
            document.querySelector("input[type=url]").value = "";
            return;
        }
        document.querySelector("input.uploadfile").click();
    };
    upload_section.append(media);

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        media.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });


    media.addEventListener('dragenter', (evt) => {
        evt.target.classList.add("dragenter");
    }, false);
    media.addEventListener('dragleave', (evt) => {
        document.querySelector("div.mediaobject").classList.remove("dragenter");
    }, false);
    media.addEventListener('dragover', (evt) => {
//        console.log(evt);
    }, false);
    media.addEventListener('drop', (evt) => {
        document.querySelector("div.mediaobject").classList.remove("dragenter");
        let dt = evt.dataTransfer;
        console.log(dt.items);
        let files = dt.files;
        if (files.length > 0) {
            prepareFile(files[0]);
            return;
        }
        for (const item of dt.items) {
            try {
                if (item.type.includes("url")) {
                    item.getAsString((data) => {
                        prepareFile(data);
                    });
                }
            } catch (e) {
                console.log(e);
            }
        }
    }, false);

    let fileurl = document.createElement("input");
    fileurl.type = "url";
    fileurl.placeholder = getCssString("--upload-media-file-url");
    ;
    fileurl.pattern = "https://.*";
    fileurl.onchange = (evt) => {
        setUploadedMedia(evt.srcElement.value);
    };
    upload_section.append(fileurl);

    let comments_div = document.createElement("div");
    let comments = document.createElement("textarea");
    let comments_preview = document.createElement("div");
    comments.classList.add("comentario_textarea");
    comments_preview.classList.add("comentario_preview");
    comments.placeholder = getCssString("--upload-optional-comments");
    comments_div.appendChild(comments);
    comments_div.appendChild(comments_preview);
    comments_div.classList.add("comentario_container");
    upload_section.appendChild(comments_div);
    let ta_input = (arg) => {
        document.querySelector(".comentario_textarea").style.height = Number(document.querySelector(".comentario_textarea").scrollHeight - 4) + "px";
        let texto = document.querySelector(".comentario_textarea").value;
        texto = markdownParser(texto);
        document.querySelector(".comentario_preview").innerHTML = texto;
        recalcMaxVal(arg);
        if (document.querySelector(".comentario_textarea").value.length > 0)
            return;
        document.querySelector(".comentario_preview").innerHTML = "";
        document.querySelector(".comentario_textarea").style.height = "";
    };

    comments.oninput = ta_input;
    comments.onkeypress = ta_input;

    let footer = document.createElement("footer");
    let original_label_div = document.createElement("div");
    original_label_div.classList.add("original_label_div");
    let original_label = document.createElement("label");
    original_label.title = getCssString("--upload-original-media-w");
    let original = document.createElement("input");
    original_label.appendChild(original);
    original_label.classList.add("original_label");
    original_label_div.appendChild(original_label);
    original.setAttribute("type", "checkbox");
    original.onchange = recalcMaxVal;

    let highvalue_label_div = document.createElement("div");
    highvalue_label_div.classList.add("highvalue_label_div");
    let highvalue_label = document.createElement("label");
    highvalue_label.title = getCssString("--upload-high-value-post-w");
    let highvalue = document.createElement("input");
    highvalue_label.appendChild(highvalue);
    highvalue_label.classList.add("highvalue_label");
    highvalue_label_div.appendChild(highvalue_label);
    highvalue.setAttribute("type", "checkbox");
    highvalue.onchange = recalcMaxVal;

    let button_div = document.createElement("div");
    button_div.classList.add("button_div");
    let button = document.createElement("button");
    let maxpay = document.createElement("div");
    let maxpay_output = document.createElement("output");
    let maxpay_span = document.createElement("span");
    maxpay_span.classList.add("maxpay_span");
    maxpay.append(maxpay_span);
    maxpay.append(maxpay_output);
    maxpay.classList.add("maxpay");
    button_div.appendChild(maxpay);
    button_div.appendChild(button);
    button.classList.add("button_publish");
    button.onclick = createPost;

    let tags_div = document.createElement("div");
    tags_div.classList.add("tags_div");
    let tags = document.createElement("input");
    tags_div.appendChild(tags);
    tags.classList.add("tags");
    tags.placeholder = getCssString("--upload-tags");
    tags.title = getCssString("--upload-tags-w");
    ;


    footer.appendChild(original_label_div);
    footer.appendChild(highvalue_label_div);
    footer.appendChild(tags_div);
    footer.appendChild(button_div);
    upload_section.appendChild(footer);


//    
//    let canvas = document.createElement("canvas");
//    canvas.classList.add("imageupload");
//    upload_section.appendChild(canvas);
//    


    document.getElementById("posts_container").appendChild(upload_section);
    recalcMaxVal();
};

var setUploadedMedia = (link) => {
    let request = new XMLHttpRequest();
    let mo = document.querySelector(".mediaobject");
    mo.innerHTML = "Wait...";
    request.onreadystatechange = function () {
        if (request.readyState === request.HEADERS_RECEIVED) {
            let mo = document.querySelector(".mediaobject");
            mo.innerHTML = "";
            const contentType = request.getResponseHeader("Content-Type");
            if (contentType.startsWith("image")) {
                let img = document.createElement("img");
                img.src = request.responseURL;
                mo.appendChild(img);
                mo.setAttribute("ct", "image");
                return;
            }
            if (contentType.startsWith("video")) {
                let video = document.createElement("video");
                let source = document.createElement("source");
                source.src = request.responseURL;
                video.appendChild(source);
                video.setAttribute("controls", "");
                video.setAttribute("loop", "");
                video.setAttribute("mute", "");
                mo.appendChild(video);
                mo.setAttribute("ct", "video");
                return;
            }
            mo.innerHTML = "Error";
            document.querySelector("input[type=url]").value = "";
        }
    };
    try {
        request.open("HEAD", link, true);
        request.send();
        return true;
    } catch (e) {
        mo.innerHTML = "Error";
        return false;
    }
};

var logar = (username) => {
    if (username !== null && username !== "")
        hive_keychain.requestSignBuffer(username, "login", 'Posting', (response) => {
            if (response.success === true) {
                const decodedMessage = response.result;
                localStorage.username = username;
                let req = new XMLHttpRequest();
                req.addEventListener("load", (res) => {
                    document.querySelector(".userprofile img").src = JSON.parse(res.target.response)["result"]["metadata"]["profile"]["profile_image"];
                });
                req.open("POST", localStorage.hiveNode);
                request = {
                    "id": idrequest++,
                    "jsonrpc": "2.0",
                    "method": "bridge.get_profile",
                    "params": {
                        "account": localStorage.username,
                        "observer": localStorage.username
                    }
                };
                req.send(JSON.stringify(request));
                document.querySelector(".userprofile span").innerHTML = localStorage.username;
                document.querySelector(".userprofile").setAttribute("logado", "");
                document.querySelector(".userprofile a.loggedon").href = rootUrl + "@" + localStorage.username;
            } else {
                localStorage.username = "";
                alert("Unable to login");
            }
        });
};

var prepareFile = (arquivo) => {
    let formData = new FormData();
    if (typeof arquivo === "string")
        formData.append("url", arquivo);
    else
        formData.append("uploadfile", arquivo);

    document.querySelector(".mediaobject").innerHTML = "";
    document.querySelector(".mediaobject").append(document.createElement("progress"));
    uploadFile(formData, function (resposta) {
        if (setUploadedMedia("https://qdp.hivetasks.com/ipfs/" + JSON.parse(resposta).Hash))
            document.querySelector("input[type=url]").value = "https://qdp.hivetasks.com/ipfs/" + JSON.parse(resposta).Hash;
    }, function (tamanhoEnviado, tamanhoTotal) {
        document.querySelector("[upload] .mediaobject progress").max = tamanhoTotal;
        document.querySelector("[upload] .mediaobject progress").value = tamanhoEnviado;
        console.log(tamanhoEnviado / tamanhoTotal * 100 + "%");
    });
};

/**
 *
 * @param {FormData} formData
 * @param {function} callback(resposta)
 * @param {function} progress(parte,total)
 * @returns {void}
 */
var uploadFile = function (formData, callback, progress) {
    let request = new XMLHttpRequest();
    if (progress !== undefined)
        request.upload.onprogress = function (e) {
            progress(e.loaded, e.total);
        };
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            callback(this.response);
        }
    };
    request.open("POST", rootUrl + "/ipfshandler", true);
    request.send(formData);
};

var createPost = () => {
    let date = new Date().toISOString();
    let permlink = "qdp-" + date.slice(0, 10) + "-" + date.slice(11, 16).replace(":", "-");
    let post_title = document.querySelector(".titulo_textarea").value;
    let post_tags = document.querySelector(".tags").value;
    tags = [];
    if (!tags.includes("hive-179234"))
        tags.push('hive-179234');
    tags = tags.concat(post_tags.split(" ")).filter(element => {
        return element !== '';
    });

    if (tags.length > 10) {
        alert("Over 10 tags");
        return;
    }

    let maxpay = recalcMaxVal();
    let post_body = createPostContent(permlink).outerHTML;

    let contrib = [
        0, {
            "beneficiaries": [
                {"account": "hive-179234", "weight": 1000}
            ]
        }
    ];
    if (maxpay === 0.01) {
//        contrib = [];
        maxpay === 0.02;
        if (!tags.includes("penny-post"))
            tags.push("penny-post");
    }

    let metadata = {
        app: "QDPost v0.0.1",
        format: "html",
        //"description":"A QPD quick post...",
        tags: tags,
        image: [],
        video: []
    };

    if (document.querySelector(".mediaobject").attributes["ct"].value === "image") {
        metadata.image.push(document.querySelector("input[type=url]").value);
    } else if (document.querySelector(".mediaobject").attributes["ct"].value === "video") {
        metadata.video.push(document.querySelector("input[type=url]").value);
        if (!tags.includes("video"))
            tags.push("video");
    }

    ops = [
        [
            "comment",
            {
                "author": localStorage.username,
                "title": post_title,
                "body": post_body,
                "parent_author": "",
                "parent_permlink": tags[0],
                "permlink": permlink,
                "json_metadata": JSON.stringify(metadata)
            }
        ],
        [
            "comment_options",
            {
                "author": localStorage.username,
                "permlink": permlink,
                "max_accepted_payout": maxpay.toFixed(3) + " HBD",
                "percent_hbd": 0,
                "allow_votes": true,
                "allow_curation_rewards": true,
                "extensions": [
                    [
                        0, {
                            "beneficiaries": [
                                {"account": "hive-179234", "weight": 1000}
                            ]
                        }
                    ]
                ]
            }
        ]
    ];
    console.log(JSON.stringify(ops));
    window.hive_keychain.requestHandshake(() => {
        window.hive_keychain.requestBroadcast(localStorage.username, ops, 'Posting', (response) => {
            console.log(response);
            if (response.success) {
                alert(response.message);
                location.href = "/";
            } else
                alert(response.message);
        });
    });
};

var recalcMaxVal = () => {
    let maxval = 0.01;
    let text = document.querySelector("[upload] .comentario_textarea").value;
    let count = 0;
    let split = text.split(' ');
    for (var i = 0; i < split.length; i++) {
        if (split[i] !== "") {
            count++;
        }
    }
    split = text.split("\n");
    for (var i = 0; i < split.length; i++) {
        if (split[i] !== "") {
            count++;
        }
    }
    maxval = maxval + 0.01 * count;
    maxval = maxval < 5 ? maxval : 5;
    maxval = document.querySelector(".original_label_div input").checked ? maxval + 0.99 : maxval;
    maxval = document.querySelector(".highvalue_label_div input").checked ? 10 : maxval;
    document.querySelector(".maxpay output").innerHTML = maxval.toFixed(3);
    return maxval;
};

var createPostContent = (permlink = null) => {
    let postData = document.createElement("div");
    let mediacenter = document.createElement("center");
    mediacenter.classList.add("media");
    if (document.querySelector(".mediaobject").attributes["ct"].value === "image") {
        let img = document.createElement("img");
        img.src = document.querySelector("input[type=url]").value;
        mediacenter.appendChild(img);
    } else if (document.querySelector(".mediaobject").attributes["ct"].value === "video") {
        let video = document.createElement("video");
        let source = document.createElement("source");
        source.src = document.querySelector("input[type=url]").value;
        video.appendChild(source);
        video.setAttribute("controls", "");
        video.setAttribute("loop", "");
        video.setAttribute("mute", "");
        mediacenter.appendChild(video);
    }
    let comment = document.createElement("div");
    let declarations = document.createElement("div");
    let signature = document.createElement("div");
    let signature_a = document.createElement("a");
    signature.classList.add("dappsignature");

    signature_a.href = permlink !== null ? "https://qdp.hivetasks.com/@" + localStorage.username + "/" + permlink : "https://qdp.hivetasks.com";
    signature_a.target = "blank";
    signature_a.append("QDP from Hivetasks");

    signature.append("This post was created by ");
    signature.append(signature_a);

    comment.classList.add("comment");
    comment.classList.add("text-justify");
    comment.appendChild(new DOMParser().parseFromString("<div>" + markdownParser(document.querySelector(".comentario_textarea").value) + "</div>", "text/xml").firstChild);

    let ul = document.createElement("ul");
    declarations.appendChild(ul);
    if (document.querySelector(".original_label_div input").checked) {
        let li = document.createElement("li");
        li.append("The author declares this post to be original content.");
        ul.appendChild(li);
    }
    if (document.querySelector(".highvalue_label_div input").checked) {
        let li = document.createElement("li");
        li.append("The author declares this post to be of high value.");
        ul.appendChild(li);
    }

    postData.appendChild(mediacenter);
    postData.appendChild(comment);
    postData.append(signature);
    declarations.appendChild(ul);
    if (ul.children.length > 0)
        postData.appendChild(declarations);



    console.log(postData.outerHTML);
    return postData;
};


var markdownParser = (markdown) => {
    const htmlText = markdown
//     .replace(/\n\n(.*)\n\n/gim, '\n\n<p>$1</p>\n\n')
//            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
//            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
//            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
//            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
//            .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
//            .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
//            .replace(/^\> (.*$)\n/gim, '<blockquote><q><em>$1</em></q></blockquote>')
//            .replace(/^(.*$)/gim, '$1<br />')
//            .replace(/ \*\*(.+)\*\*/gim, '<strong> $1</strong>')
//            .replace(/ \*(.+)\* /gim, '<em>$1</em>')
//            .replace(/\!\[(.*)\]\((.*)\)/gim, '<img src="$2" alt="$1" />')
//            .replace(/[^\!]\[(.*)\]\((.*)\)/gim, '<a href="$2" target="_blank">$1</a>')
//
//            .replace(/^\\(.*$)/gim, '$1')
//            .replace(/([^\/]\>)[ \r\n]*\<br \/\>[ \r\n]*(\<)?/gim, '$1$2');
    return htmlText.trim();
};

var getTopTags = () => {
    document.querySelector(".topics").innerHTML = "";
    document.querySelector(".topics").append(document.createElement("ul"));
    let req = new XMLHttpRequest();
    req.addEventListener("load", (res) => {
        let posts = JSON.parse(res.target.response)["result"];
        posts.forEach((post) => {
            let arr = post.json_metadata.tags;
            arr.splice(arr.indexOf("hive-179234"), 1);
            arr.forEach((item) => {
                if (document.querySelector(".topics ul li#" + item) === null) {
                    let li = document.createElement("li");
                    let a = document.createElement("a");
                    a.href = rootUrl + "tag/" + item;
                    a.append(item);
                    li.id = item;
                    li.setAttribute("qtd", 1);
                    li.append(a);
                    document.querySelector(".topics ul").append(li)
                    return;
                }
                let li = document.querySelector(".topics ul li#" + item);
                li.setAttribute("qtd", Number(li.getAttribute("qtd")) + 1);
            });
            Array.from(document.querySelectorAll(".topics ul li")).sort((a, b) => Number(a.getAttribute("qtd")) < Number(b.getAttribute("qtd"))).forEach(el => el.parentNode.appendChild(el));
        });
    });
    req.open("POST", localStorage.hiveNode);

    request = {
        "id": idrequest++,
        "jsonrpc": "2.0",
        "method": "bridge.get_ranked_posts",
        "params": {
            "tag": "hive-179234",
            "sort": "created",
            "limit": 50,
            "start_author": null,
            "start_permlink": null,
            "observer": localStorage.username
        }
    };
    req.send(JSON.stringify(request));
}
