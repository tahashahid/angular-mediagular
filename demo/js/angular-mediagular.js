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
                            evt.target.playVideo();
                            evt.target.d.style.display = 'none';
                            evt.target.d.style.pointerEvents = 'none';
                        },
                        onStateChange: function(evt){
                            switch (evt.data){
                                case -1:
                                    $rootScope.$broadcast("mg.stop");
                                    evt.target.d.style.display = 'none';
                                    break;
                                case 0:
                                    $rootScope.$broadcast("mg.endMedia");
                                    evt.target.d.style.display = 'none';
                                    break;
                                case 1:
                                    $rootScope.$broadcast("mg.playing");
                                    evt.target.d.style.display = 'block';
                                    break;
                                case 2:
                                    $rootScope.$broadcast("mg.paused");
                                    break;
                            }
                        }

                    }
                });
            }
        })
        .run(function($templateCache){
            $templateCache.put("ngMediagular.html",
                    '<audio id="audioplayer"></audio>'
                    + '<div id="youtubePlayer"></div>'
            )
        })
        .directive("ngMediagular", function($rootScope){
            return {
                restrict: "AEC",
                templateUrl: "ngMediagular.html",
                link: function(scope, element, attr){
                    var player = $rootScope.mediagular[attr.name || "player"] = {};
                    player.currentIndex = 0;
                    player.currentPlayer = '';
                    var $audioPlayer = element.children("#audioplayer");
                    var audioPlayer = $audioPlayer[0];

                    player.scAPI = attr.scapi;
                    player.playlist = [
                        {
                            src: "https://api.soundcloud.com/tracks/56542489/stream" + '?client_id=' + player.scAPI,
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
                            src: "https://api.soundcloud.com/tracks/163038821/stream" + '?client_id=' + player.scAPI,
                            provider: "soundcloud"
                        }
                    ];

                    $audioPlayer.on("ended", function(){
                        $rootScope.$broadcast("mg.endMedia")
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

                    player.playSoundCloud = function(src, autoplay){
                        $audioPlayer.attr("autoplay", autoplay || '');
                        $audioPlayer.attr("src", src);
                        player.currentPlayer = "soundcloud";

                    };

                    player.playYoutube = function(src, autoplay){
                        youtubePlayer.loadVideoById(src);
                        player.currentPlayer = "youtube";
                    };
                    player.playMedia = function(mediaObj){
                        player.stop();
                        player.singlePlay = true;
                        if(mediaObj.provider == "youtube"){
                            player.playYoutube(mediaObj.src, true)
                        }else if(mediaObj.provider == "soundcloud"){
                            player.playSoundCloud(mediaObj.src, true)
                        }
                    };

                    player.playQue = function(){
                        player.stop();
                        player.singlePlay = false;
                        var media = player.playlist[player.currentIndex];
                        $rootScope.$broadcast("mg.playNext", media);
                    };

                    player.startQue = function(){
                        player.currentIndex = 0;
                        player.playQue();
                    }

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
                        $rootScope.$broadcast("mg.playNext", media);
                    });

                    scope.$on("mg.Stop", function(event){
                        player.currentIndex = 0;
                        player.currentPlayer = '';
                    })

                }
            }
        })
})();