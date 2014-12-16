/**
 * Created by Taha Shahid on 12/8/2014.
 * Angular Media Component (play audio video native,soundcloud,youtube etc.)
 * v0.0.1
 */

(function(){
    'use strict';


    var youtubePlayer;
    angular.module("ngMediagular", [])
        .run(function($rootScope){
            $rootScope.mediagular = $rootScope.mediagular || {};

            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubePlayerAPIReady = onYouTubePlayerAPIReady;
            function onYouTubePlayerAPIReady() {
                youtubePlayer = new YT.Player('youtubePlayer', {
                    height: '390',
                    width: '640',
                    videoId: '',
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        rel : 0
                    },
                    events: {
                        onReady: function(evt){
                            var target = evt.target;
                            target.playVideo();
                            target.d.style.display = 'none';
                            target.d.style.pointerEvents = 'none';
                            target.d.parentNode.style.display = "block";
                        },
                        onStateChange: function(evt){
                            switch (evt.data){
                                case -1:
                                    $rootScope.$apply(function(){
                                        $rootScope.$broadcast("mg.stop");
                                    });
                                    evt.target.d.style.display = 'none';
                                    break;
                                case 0:
                                    $rootScope.$apply(function(){
                                        $rootScope.$broadcast("mg.endMedia");
                                    });
                                    evt.target.d.style.display = 'none';
                                    break;
                                case 1:
                                    $rootScope.$apply(function(){
                                        $rootScope.$broadcast("mg.playing", "youtube");

                                    });
                                    evt.target.d.style.display = 'block';
                                    break;
                                case 2:
                                    $rootScope.$apply(function(){
                                        $rootScope.$broadcast("mg.paused");
                                    });
                                    break;
                            }
                        }

                    }
                });
            }
        })
        .run(function($templateCache){
            $templateCache.put("ngMediagular.html",
                '<style>#youtubePlayer{max-height: 100%;max-width: 100%;height: 250px}</style>'
                + '<div style="display: none;height: 250px">'
                + '<video id="audioplayer" poster="{{player.currentlyPlaying.poster}}"></video>'
                + '<div id="youtubePlayer"></div>'
                + '</div>'
                + '<div ng-transclude></div>'
            )
        })
        .directive("ngMediagular", function($rootScope){
            return {
                restrict: "AEC",
                templateUrl: "ngMediagular.html",
                transclude: true,
                link: function(scope, element, attr){
                    var player = $rootScope.mediagular[attr.name || "player"] = {};
                    scope.player = player;
                    player.currentIndex = -1;
                    player.currentPlayer = '';
                    var $audioPlayer = angular.element(element[0].querySelector("#audioplayer"));
                    var audioPlayer = $audioPlayer[0];

                    player.scAPI = attr.scapi;
                    player.playlist = [

                        /*sample youtube obj
                         {
                         src: "qUJYqhKZrwA",
                         provider: "youtube"
                         }*/
                        /*
                         sample soundcloudobj
                         {
                         src: "https://api.soundcloud.com/tracks/56542489/stream" + '?client_id=' + player.scAPI,
                         provider: "soundcloud"
                         }*/

                        /* {
                         src: "https://api.soundcloud.com/tracks/56542489/stream",
                         provider: "soundcloud"
                         },
                         {
                         src: "qUJYqhKZrwA",
                         provider: "youtube"
                         },

                         {
                         src: "qUJYqhKZrwA",
                         provider: "youtube"
                         },

                         {
                         src: "https://api.soundcloud.com/tracks/163038821/stream",
                         provider: "soundcloud"
                         }*/
                    ];

                    $audioPlayer.on("ended", function(){
                        $rootScope.$apply(function(){
                            $rootScope.$broadcast("mg.endMedia")
                        })
                    });
                    $audioPlayer.on("playing", function(){
                        $rootScope.$apply(function(){
                            $rootScope.$broadcast("mg.playing", player.currentPlayer)
                        })
                    });

                    player.play = function(){

                        if(player.currentPlayer == "soundcloud"){
                            audioPlayer.play();
                        }else if(player.currentPlayer == "youtube"){
                            youtubePlayer.playVideo();
                        }else{
                            $rootScope.$broadcast("mg.noMediaToPlay");
                            return;
                        }
                        $rootScope.$broadcast("mg.playing", player.currentPlayer);
                    };
                    player.pause = function(){
                        if(player.currentPlayer == "soundcloud"){
                            audioPlayer.pause();
                        }else if(player.currentPlayer == "youtube"){
                            youtubePlayer.pauseVideo();
                        }else{
                            $rootScope.$broadcast("mg.noMediaToPause");
                            return;
                        }
                        $rootScope.$broadcast("mg.paused", player.currentPlayer);
                    };
                    player.toggle = function(){
                        if(player.currentPlayer == "soundcloud"){
                            $rootScope.$broadcast("mg.Toggle");
                            if(audioPlayer.paused){
                                player.play()
                            }else{
                                player.pause()
                            }
                        }else if(player.currentPlayer == "youtube"){
                            $rootScope.$broadcast("mg.Toggle");
                            if(youtubePlayer.getPlayerState() == 2){
                                player.play()
                            }else{
                                player.pause()
                            }
                        }else{
                            $rootScope.$broadcast("mg.noMediaToToggle");
                            return false;
                        }

                    };
                    player.stop = function(){
                        if(player.currentPlayer == "soundcloud"){
                            audioPlayer.pause();
                            $audioPlayer.attr("src", "");
                        }else if(player.currentPlayer == "youtube"){
                            youtubePlayer.stopVideo();
                        }else{
                            $rootScope.$broadcast("mg.noMediaToStop");
                            return;
                        }
                        $rootScope.$broadcast("mg.stop");
                    };
                    player.next = function(){
                        player.currentIndex++;
                        player.playQue();
                    };
                    player.previous = function(){
                        player.currentIndex--;
                        player.playQue();
                    };

                    player.duration = function(){
                        if(player.currentPlayer == "soundcloud"){
                            return audioPlayer.duration;
                        }else if(player.currentPlayer == "youtube"){
                            return youtubePlayer.getDuration();
                        }else{
                            return 0;
                        }
                    };

                    player.seek = function(position){
                        if(player.currentPlayer == "soundcloud"){
                            audioPlayer.currentTime = position;
                        }else if(player.currentPlayer == "youtube"){
                            youtubePlayer.seekTo(position);
                        }else{
                            return false;
                        }
                        clearInterval(player.interval);

                    };



                    player.playSoundCloud = function(src, autoplay){
                        player.currentlyPlaying.poster = player.currentlyPlaying.img_src;
                        $audioPlayer.attr("autoplay", autoplay || '');
                        $audioPlayer.attr("src", src + '?client_id=' + player.scAPI);
                        player.currentPlayer = "soundcloud";

                    };

                    player.playYoutube = function(src, autoplay){
                        youtubePlayer.loadVideoById(src);
                        player.currentPlayer = "youtube";
                    };
                    player.playMedia = function(mediaObj){
                        player.stop();
                        player.singlePlay = true;
                        player.currentlyPlaying = mediaObj;
                        if(mediaObj.provider == "youtube"){
                            player.playYoutube(mediaObj.src, true)
                        }else if(mediaObj.provider == "soundcloud"){
                            player.playSoundCloud(mediaObj.src, true)
                        }
                    };

                    player.playQue = function(){
                        player.stop();
                        player.singlePlay = false;
                        player.currentlyPlaying = player.playlist[player.currentIndex];

                        $rootScope.$broadcast("mg.playNext", player.currentlyPlaying );
                    };

                    player.startQue = function(){
                        player.currentIndex = 0;
                        player.playQue();
                    };

                    player.clearProgress = function(){
                        clearInterval(player.interval);
                    };

                    scope.$on("mg.endMedia", function(){
                        var playingType = player.singlePlay ? "single" : "que";
                        scope.$broadcast("mg.end."+playingType);
                    });

                    scope.$on("mg.playNext", function(event, media){
                        if(media){
                            if(media.provider == "youtube"){
                                player.playYoutube(media.src, true)
                            }else{
                                player.playSoundCloud(media.src, true)
                            }
                        }else{
                            $rootScope.$broadcast("mg.Finished")
                        }
                    });

                    scope.$on("mg.endMedia", function(event){
                        if(player.singlePlay){

                            return;
                        }
                        player.currentIndex++;
                        var media = player.playlist[player.currentIndex];
                        player.currentlyPlaying = player.playlist[player.currentIndex];
                        $rootScope.$broadcast("mg.playNext", media);
                    });

                    scope.$on("mg.Stop", function(event){
                        player.currentIndex = 0;
                        player.currentPlayer = '';
                    });

                    scope.$on("mg.playing", function(){
                        if(player.currentPlayer == "youtube"){
                            element[0].querySelector("#youtubePlayer").style.display = "block";
                            element[0].querySelector("#audioplayer").style.display = "none";
                            youtubeProgressBar($rootScope, youtubePlayer, player);
                        }else{
                            element[0].querySelector("#youtubePlayer").style.display = "none";
                            element[0].querySelector("#audioplayer").style.display = "block";
                            progressBar($rootScope, audioPlayer, player)
                        }
                        player.playing = true;
                    });
                    scope.$on("mg.play", function(){
                        player.playing = false;
                    });
                    scope.$on("mg.paused", function(){
                        player.playing = false;
                        clearInterval(player.interval);
                    });
                    scope.$on("mg.stop", function(){
                        player.playing = undefined;
                        clearInterval(player.interval);
                    });
                    scope.$on("mg.end.single", function(){
                        player.playing = undefined;
                        clearInterval(player.interval);
                    });
                    scope.$on("mg.playing", function(){
                        player.playing = true;
                    });
                    scope.$on("mg.ended", function(){
                        player.playing = undefined;
                        clearInterval(player.interval);
                    });
                }
            }
        })

    /*helpful methods*/
    function youtubeProgressBar($rootScope, ytPlayer, player){
        player.clearProgress();
        player.interval = window.setInterval(function(){

            $rootScope.$apply(function(){
                player.progress = ytPlayer.getCurrentTime();
                player.progressPercent = (ytPlayer.getCurrentTime() / ytPlayer.getDuration())*100;
                console.log(player.progressPercent)
            })



        },600);
    }

    function progressBar ($rootScope, mPlayer, player){
        player.clearProgress();
        player.interval = window.setInterval(function(){

            $rootScope.$apply(function(){
                player.progress = mPlayer.currentTime;
                player.progressPercent = (mPlayer.currentTime / mPlayer.duration)*100;
                console.log(player.progressPercent)
            })


        },600);
    }
    /*helpful methods*/
})();