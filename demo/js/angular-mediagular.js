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
                    videoId: 'kGIjetX6TBk',
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        rel : 0
                    },
                    events: {
                        onReady: function(evt){
                            evt.target.playVideo();
                            evt.target.d.style.pointerEvents = 'none';
                        },
                        onStateChange: function(state){
                            switch (state.data){
                                case 0:
                                    $rootScope.$broadcast("endMedia");
                                    break;
                                case 1:
                                    $rootScope.$broadcast("playing");
                                    break;
                                case 2:
                                    $rootScope.$broadcast("paused");
                                    break;
                            }
                        }

                    }
                });
            }
        })
        .run(function($templateCache){
            $templateCache.put("ngMediagular.html",
                ""
            )
        })
        .directive("ngMediagular", function($rootScope){
            return {
                restrict: "AEC",
//                templateUrl: "ngMediagular.html",
                link: function(scope, element, attr){
                    var player = $rootScope.mediagular[attr.name || "player"] = {};
                    player.currentIndex = 0;
                    player.currentPlayer = '';
                    var $audioPlayer = element.children("#audioplayer");
                    var audioPlayer = $audioPlayer[0];

                    player.scAPI = "9ef64d670479529e01751d02e66662bc";
                    player.playlist = [

                        {
                            src: "qUJYqhKZrwA",
                            provider: "youtube"
                        },
                        {
                            src: "https://api.soundcloud.com/tracks/56542489/stream" + '?client_id=' + player.scAPI,
                            provider: "soundcloud"
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
                        $rootScope.$broadcast("endMedia")
                    });

                    player.play = function(){

                        if(player.currentPlayer == "soundcloud"){
                            audioPlayer.play();
                        }else if(player.currentPlayer == "youtube"){
                            youtubePlayer.playVideo();
                        }else{
                            $rootScope.$broadcast("noMediaToPlay");
                            return;
                        }
                        $rootScope.$broadcast("playing", player.currentPlayer);
                    };
                    player.pause = function(){
                        if(player.currentPlayer == "soundcloud"){
                            audioPlayer.pause();
                        }else if(player.currentPlayer == "youtube"){
                            youtubePlayer.pauseVideo();
                        }else{
                            $rootScope.$broadcast("noMediaToPause");
                            return;
                        }
                        $rootScope.$broadcast("paused", player.currentPlayer);
                    };
                    player.toggle = function(){
                        if(player.currentPlayer == "soundcloud"){
                            $rootScope.$broadcast("Toggle");
                            if(audioPlayer.paused){
                                player.play()
                            }else{
                                player.pause()
                            }
                        }else if(player.currentPlayer == "youtube"){
                            $rootScope.$broadcast("Toggle");
                            if(youtubePlayer.getPlayerState() == 2){
                                player.play()
                            }else{
                                player.pause()
                            }
                        }else{
                            $rootScope.$broadcast("noMediaToToggle");
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
                            $rootScope.$broadcast("noMediaToStop");
                            return;
                        }
                        $rootScope.$broadcast("Stop");
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

                    player.playQue = function(){
                        var media = player.playlist[player.currentIndex];
                        $rootScope.$broadcast("playNext", media);
                    };


                    scope.$on("playNext", function(event, media){
                        if(media){
                            if(media.provider == "youtube"){
                                player.playYoutube(media.src, true)
                            }else{
                                player.playSoundCloud(media.src, true)
                            }
                        }else{
                            $rootScope.$broadcast("Finished")
                        }
                    });
                    scope.$on("endMedia", function(event){
                        player.currentIndex++;
                        var media = player.playlist[player.currentIndex];
                        $rootScope.$broadcast("playNext", media);
                    });

                    scope.$on("Stop", function(event){
                        player.currentIndex = 0;
                        player.currentPlayer = '';
                    })

                }
            }
        })
})();